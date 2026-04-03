const fetch = require("@replit/node-fetch");
const fs = require("fs");
const path = require("path");

const Config = require(path.join(__dirname, "config.json"));

WEBHOOK_URL = Config["WebhookURL"];

DEPLOY_HISTORY_URL = "https://setup.rbxcdn.com/DeployHistory.txt";
CURRENT_VERSION_URL =
  "https://clientsettings.roblox.com/v2/client-version/WindowsPlayer/channel/LIVE";
ZBETA_VERSION_URL =
  "https://clientsettings.roblox.com/v2/client-version/WindowsPlayer/channel/ZBeta";

KNOWN_FILE = path.join(__dirname, "known.json");

async function SendPreUpdate(VersionHash) {
  const EmbedData = {
    content: `<@&${Config["PingRoleID"]}>`,
    embeds: [
      {
        title: "Future Update Detected",
        description: Config["EmbedDescriptions"]["PreUpdate"],
        color: 3639030,
        footer: Config["EmbedFooter"],
        timestamp: new Date().toISOString(),
        fields: [
          {
            name: "Version",
            value: "`" + VersionHash + "`",
            inline: true,
          },
          {
            name: "Timestamp",
            value: `<t:${Math.floor(Date.now() / 1000)}:f>`,
            inline: true,
          },
        ],
      },
    ],
    attachments: [],
    components: [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 5,
            label: "Download Version",
            emoji: {
              name: "💠",
            },
            url: `https://rdd.whatexpsare.online/?channel=LIVE&binaryType=WindowsPlayer&version=${VersionHash}`,
          },
        ],
      },
    ],
  };

  const Response = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(EmbedData),
  });

  console.log("SendPreUpdate, status code:", Response.status);
}

async function SendUpdate(VersionHash) {
  const EmbedData = {
    content: `<@&${Config["PingRoleID"]}>`,
    embeds: [
      {
        title: "Update Detected",
        description: Config["EmbedDescriptions"]["Update"],
        color: 16725044,
        footer: Config["EmbedFooter"],
        timestamp: new Date().toISOString(),
        fields: [
          {
            name: "Version",
            value: "`" + VersionHash + "`",
            inline: true,
          },
          {
            name: "Timestamp",
            value: `<t:${Math.floor(Date.now() / 1000)}:f>`,
            inline: true,
          },
        ],
      },
    ],
    attachments: [],
    components: [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 5,
            label: "Download Version",
            emoji: {
              name: "💠",
            },
            url: `https://rdd.whatexpsare.online/?channel=LIVE&binaryType=WindowsPlayer&version=${VersionHash}`,
          },
        ],
      },
    ],
  };

  const Response = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(EmbedData),
  });

  console.log("SendUpdate, status code:", Response.status);
}

async function CheckDeployHistory() {
  try {
    const KnownVersions = JSON.parse(fs.readFileSync(KNOWN_FILE, "utf-8"));

    const DeployHistoryRaw = await fetch(DEPLOY_HISTORY_URL);
    const DeployHistory = await DeployHistoryRaw.text();

    const Lines = DeployHistory.split(/\r?\n/);
    var MostRecentVersion = "";

    for (let I = Lines.length - 1; I >= 0; I--) {
      const Line = Lines[I];
      const Match = Line.match(/WindowsPlayer.*version-[a-f0-9]+/i);
      if (Match) {
        MostRecentVersion = Match[0].match(/version-[a-f0-9]+/i)[0];
        break;
      }
    }

    if (MostRecentVersion === "" || MostRecentVersion === undefined) {
      console.log("Couldn't get most recent version, got:", MostRecentVersion);
      return;
    }

    //console.log("Most recent version:", MostRecentVersion);
    if (!KnownVersions["Unpublished"][MostRecentVersion]) {
      console.log("new unpublished version!!");

      KnownVersions["Unpublished"][MostRecentVersion] = {
        FirstSeen: new Date().toISOString(),
      };

      fs.writeFileSync(KNOWN_FILE, JSON.stringify(KnownVersions, null, 4));
      await SendPreUpdate(MostRecentVersion);
    }
  } catch (e) {
    console.log("Error in CheckDeployHistory", e);
  }
}

async function CheckZBeta() {
  try {
    const KnownVersions = JSON.parse(fs.readFileSync(KNOWN_FILE, "utf-8"));

    const VersionInfoRaw = await fetch(ZBETA_VERSION_URL);
    const VersionInfo = await VersionInfoRaw.json();
    if(VersionInfo["errors"]) return;

    const CurrentVersion = VersionInfo["clientVersionUpload"];

    if (CurrentVersion === undefined) {
      console.log("Couldn't get current version, got:", VersionInfo);
      return;
    }

    //console.log("Current version:", CurrentVersion);
    if (!KnownVersions["Unpublished"][CurrentVersion]) {
      console.log("new published version!!");

      KnownVersions["Unpublished"][CurrentVersion] = {
        FirstSeen: new Date().toISOString(),
      };

      fs.writeFileSync(KNOWN_FILE, JSON.stringify(KnownVersions, null, 4));
      await SendPreUpdate(CurrentVersion);
    }
  } catch (e) {
    console.log("Error in CheckZBeta", e);
  }
}

async function CheckCurrentVersion() {
  try {
    const KnownVersions = JSON.parse(fs.readFileSync(KNOWN_FILE, "utf-8"));

    const VersionInfoRaw = await fetch(CURRENT_VERSION_URL);
    const VersionInfo = await VersionInfoRaw.json();
    const CurrentVersion = VersionInfo["clientVersionUpload"];

    if (CurrentVersion === undefined) {
      console.log("Couldn't get current version, got:", VersionInfo);
      return;
    }

    //console.log("Current version:", CurrentVersion);
    if (!KnownVersions["Published"][CurrentVersion]) {
      console.log("new published version!!");

      KnownVersions["Published"][CurrentVersion] = {
        FirstSeen: new Date().toISOString(),
      };

      fs.writeFileSync(KNOWN_FILE, JSON.stringify(KnownVersions, null, 4));
      await SendUpdate(CurrentVersion);
    }
  } catch (e) {
    console.log("Error in CheckCurrentVersion", e);
  }
}

async function CheckForUpdates() {
  await CheckDeployHistory();
  await CheckCurrentVersion();
  await CheckZBeta();
}

CheckForUpdates();
setInterval(CheckForUpdates, 10000);
console.log("update tracker running");
