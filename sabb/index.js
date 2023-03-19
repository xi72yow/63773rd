import inquirer from "inquirer";
import inquirerPrompt from "inquirer-autocomplete-prompt";
import { search, getDetails, getSeason } from "./createQuery.js";
import { mergeJson, getJson, home_dir } from "./dataApi.js";
import { getMkvFilesInfo, createJellyfinStructure } from "./fileApi.js";
import { promises as fs } from "fs";
import path from "path";

const currentPath = process.cwd();

inquirer.registerPrompt("autocomplete", inquirerPrompt);

//new inquirer.Separator(),

let fetchTimeout = null;

function generateUID() {
  return Math.random().toString(36).slice(-6);
}

function processShow() {
  return new Promise(async (resolve) => {
    const currentData = await getJson();

    const mkvFiles = await getMkvFilesInfo(currentPath);

    const seasonPath = await createJellyfinStructure(
      home_dir,
      currentData.openSeason
    );

    let processedEpisodes = 0;
    await Promise.all(
      mkvFiles.map(async (mkvFile, index) => {
        const episode = currentData.openSeason.episodes[index];
        if (mkvFile.file.startsWith("B")) {
          const newFileName = `S${String(episode.season_number).padStart(
            2,
            "0"
          )}E${String(episode.episode_number).padStart(2, "0")} ${
            episode.name
          } [tmdbid-${episode.id}].mkv`;
          console.log(
            "copying: ",
            mkvFile.file,
            "with duration of ",
            mkvFile.playtime,
            " to: ",
            newFileName
          );
          await fs.copyFile(
            path.join(currentPath, mkvFile.file),
            path.join(seasonPath, newFileName)
          );
          processedEpisodes++;
        } else {
          const newExtraName = `z${generateUID()}-other.mkv`;
          console.log(
            "copying: ",
            mkvFile.file,
            "with duration of ",
            mkvFile.playtime,
            " to: ",
            newExtraName
          );
          await fs.copyFile(
            path.join(currentPath, mkvFile.file),
            path.join(seasonPath, newExtraName)
          );
        }
        /*       //rename old file
      await fs.rename(
        path.join(currentPath, mkvFile.file),
        path.join(currentPath, mkvFile.file + ".processed")
      ); */
      })
    );

    currentData.openSeason.episodes =
      currentData.openSeason.episodes.slice(processedEpisodes);

    await mergeJson(currentData);

    resolve();
  });
}

getJson().then(async (data) => {
  const { openSeason, lastSearches } = data;

  if (openSeason.episodes.length > 0) {
    const answer = await inquirer.prompt([
      {
        type: "confirm",
        name: "proceed",
        message: `Found open Season with ${openSeason.episodes.length} Episodes, do you want to proceed?`,
        default: false,
      },
    ]);
    if (answer.proceed) {
      console.log(
        `Found open Season with ${openSeason.episodes.length} Episodes`
      );
      await processShow();
    } else {
      const answer = await inquirer.prompt([
        {
          type: "autocomplete",
          name: "media",
          pageSize: 30,
          message: "Search for your Media: ",
          source: (answersSoFar, input = "") => {
            return new Promise((resolve) => {
              if (input.length < 3) {
                return resolve(lastSearches);
              }
              clearTimeout(fetchTimeout);
              fetchTimeout = setTimeout(async () => {
                const response = await search(input);
                const results = response
                  .filter((value) => {
                    return (
                      value.media_type === "tv" || value.media_type === "movie"
                    );
                  })
                  .map((item) => {
                    return {
                      name: `${item.name || item.original_title} (${
                        item.media_type
                      }) --> ${item.overview.replace(/(\r\n|\n|\r)/gm, "")}`,
                      value: `${item.id}#${item.media_type}`,
                    };
                  });
                resolve(results);
              }, 2000);
            });
          },
        },
        {
          type: "input",
          name: "season",
          message: "Wich Season? ",
          validate: (value) => {
            if (value.length > 0 && value.match(/^[0-9]+$/)) {
              return true;
            } else {
              return "Please enter a valid Season...";
            }
          },
          when: (answers) => {
            return answers.media.split("#")[1] === "tv";
          },
        },
      ]);

      const [id, type, season] = answer.media.split("#");

      const details = await getDetails(id, type);

      if (type === "tv") {
        const seasonDetails = await getSeason(id, answer.season);
        const showId = details.id;
        const showName = details.name;
        const seasonId = seasonDetails.id;
        const seasonName = seasonDetails.name;

        const searces = [
          {
            name: `${showName}`,
            value: `${id}#${type}`,
          },
          ...lastSearches,
        ];

        const uniqueSearches = searces.filter(
          (thing, index, self) =>
            index === self.findIndex((t) => t.value === thing.value)
        );

        const conf = {
          lastSearches: uniqueSearches,
          openSeason: {
            showId,
            showName,
            seasonId,
            seasonName,
            episodes: seasonDetails.episodes,
          },
        };

        await mergeJson(conf);
        await processShow();
      }
    }
  }

  console.log("done! 🎉");
});
