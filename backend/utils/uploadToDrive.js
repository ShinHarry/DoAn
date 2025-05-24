const { google } = require("googleapis");

// Lấy JSON credentials từ biến môi trường
const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS);

const auth = new google.auth.GoogleAuth({
  credentials, // Dùng credentials trực tiếp
  scopes: ["https://www.googleapis.com/auth/drive.file"],
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

  return `https://drive.google.com/uc?id=${response.data.id}`;
};

module.exports = { uploadFileToDrive };
