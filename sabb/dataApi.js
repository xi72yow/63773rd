import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "node:url";
import _ from "lodash";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const home_dir =
  process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;

const data_dir = path.join(home_dir, ".sabb");
const data_file = path.join(data_dir, "data.json");

function checkFileExists(file) {
  return fs
    .access(file, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);
}

const createDataFile = () => {
  return new Promise(async (resolve, reject) => {
    if (!(await checkFileExists(data_dir))) {
      await fs.mkdir(data_dir);
    }
    if (!(await checkFileExists(data_file))) {
      await saveJson(
        {
          lastSearches: [],
          openSeason: {
            showId: null,
            showName: null,
            seasonId: null,
            seasonName: null,
            episodes: [],
          },
        },
        data_file
      );
    }
    resolve();
  });
};

const saveJson = async (data) => {
  return fs.writeFile(data_file, JSON.stringify(data, null, 2));
};

const readJson = async () => {
  return fs.readFile(data_file, "utf8");
};

const mergeJson = async (data) => {
  const oldData = await getJson();
  const newData = _.assign(oldData, data);
  return new Promise(async (resolve, reject) => {
    try {
      await saveJson(newData);
      resolve(newData);
    } catch (error) {
      console.log("🚀 ~ file: dataApi.js:50 ~ returnnewPromise ~ error", error);
    }
  });
};

const getJson = () => {
  return new Promise(async (resolve, reject) => {
    await createDataFile();
    const oldData = await readJson();
    resolve(JSON.parse(oldData));
  });
};

export {
  createDataFile,
  saveJson,
  getJson,
  mergeJson,
  home_dir,
  checkFileExists,
};
