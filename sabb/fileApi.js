import { promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { checkFileExists } from "./dataApi.js";

const aexec = promisify(exec);

const getMkvInfo = async (file) => {
  const mkvInfo = await aexec(`mkvinfo ${file}`);
  const mkvInfoArray = mkvInfo.stdout.split("\n");
  const mkvInfoObject = {};
  mkvInfoArray.forEach((line) => {
    if (line.includes(":")) {
      const arr = line
        .replace("+", "")
        .replace("|", "")
        .replace(" ", "")
        .trim()
        .split(":");

      mkvInfoObject[arr[0]] = arr.slice(1).join(":").trim();
    }
  });

  return mkvInfoObject;
};

const getMkvFiles = async (dir) => {
  const files = await fs.readdir(dir);
  const mkvFiles = files.filter((file) => file.endsWith(".mkv"));
  return mkvFiles;
};

const getMkvFilesInfo = async (dir) => {
  const mkvFiles = await getMkvFiles(dir);
  const mkvFilesInfo = await Promise.all(
    mkvFiles.map(async (file) => {
      const mkvInfo = await getMkvInfo(path.join(dir, file));
      return {
        file,
        playtime: mkvInfo["Dauer"],
      };
    })
  );
  return mkvFilesInfo;
};

const createJellyfinStructure = (dir, data) => {
  return new Promise(async (resolve, reject) => {
    const { showId, showName, seasonId, seasonName } = data;
    const showPath = path.join(dir, `${showName} [tmdbid-${showId}]`);
    const seasonPath = path.join(
      showPath,
      `${seasonName} [tmdbid-${seasonId}]`
    );

    if (!(await checkFileExists(showPath))) await fs.mkdir(showPath);
    if (!(await checkFileExists(seasonPath))) await fs.mkdir(seasonPath);
    resolve(seasonPath);
  });
};

export { getMkvFilesInfo, getMkvInfo, getMkvFiles, createJellyfinStructure };
