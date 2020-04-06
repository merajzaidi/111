const admin = require("firebase-admin");

const serviceAccount = {
  type: process.env.type,
  project_id: process.env.project_id,
  private_key_id: process.env.private_key_id,
  private_key: process.env.private_key.replace(/\\n/g, "\n"),
  client_email: process.env.client_email,
  client_id: process.env.client_id,
  auth_uri: process.env.auth_uri,
  token_uri: process.env.token_uri,
  auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
  client_x509_cert_url: process.env.client_x509_cert_url
};
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: `gs://${process.env.project_id}.appspot.com`
});

module.exports.uploader = async (file, type, fileName) => {
  const bucket = admin.storage().bucket();
  let destination = `${type}/${fileName}`, //change to fileName
    fileUpload = bucket.file(destination);

  try {
    await fileUpload.save(new Buffer(file.buffer));
    await fileUpload.setMetadata({
      contentType: file.mimetype
    });
    let result = await fileUpload.getSignedUrl({
      action: "read",
      expires: "03-09-2491"
    });

    return { message: "success", result };
  } catch (err) {
    return { message: "failure", err };
  }
};

module.exports.findImg = async (type, fileName) => {
  const bucket = admin.storage().bucket();
  let destination = `${type}/${fileName}`,
    fileUpload = bucket.file(destination);
  let result = await fileUpload.exists();
  return { message: "success", result };
};

module.exports.deleteImg = async (type, fileName) => {
  const bucket = admin.storage().bucket();
  let destination = `${type}/${fileName}`,
    fileUpload = bucket.file(destination);
  let result = await fileUpload.delete();
  return { message: "success", result };
};
