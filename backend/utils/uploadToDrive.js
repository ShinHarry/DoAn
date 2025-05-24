const fs = require("fs");
const { google } = require("googleapis");
const path = require("path");

const KEYFILEPATH = path.join(__dirname, "../config/credentials.json");
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

const uploadFileToDrive = async (file, folderId) => {
  const drive = google.drive({ version: "v3", auth });

  const fileMetadata = {
    name: file.originalname,
    parents: [folderId],
  };

  const media = {
    mimeType: file.mimetype,
    body: fs.createReadStream(file.path),
  };

  const response = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: "id",
  });

  await drive.permissions.create({
    fileId: response.data.id,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });

  const fileUrl = `https://drive.google.com/uc?id=${response.data.id}`;
  return fileUrl;
};

module.exports = { uploadFileToDrive };
