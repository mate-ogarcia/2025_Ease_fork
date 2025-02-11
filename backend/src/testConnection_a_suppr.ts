import * as couchbase from "couchbase";
import * as fs from "fs";

(async () => {
  try {
    console.log("🔄 Lecture du certificat...");
    const cert = fs.readFileSync("../ssl/root_cert.pem").toString();
    console.log("✅ Certificat chargé avec succès.");

    console.log("🔄 Tentative de connexion à Couchbase Capella...");
    const cluster = await couchbase.connect(
      "couchbases://cb.8gehntxewjxsh5by.cloud.couchbase.com",
      {
        username: "clusterAccesUser-ease",
        password: "easePassword1%",
        configProfile: "wanDevelopment", // Configuration pour connexion WAN
      }
    );
    console.log("✅ Connexion réussie à Couchbase Capella.");

    console.log("🔄 Tentative d’accès au bucket...");
    const bucket = cluster.bucket("ProductsBDD");
    console.log("✅ Bucket connecté avec succès.");

    console.log("🔄 Accès à la collection par défaut...");
    const collection = bucket.defaultCollection();
    console.log("✅ Collection par défaut connectée.");

    console.log("🎉 Test terminé avec succès !");
    await cluster.close();
  } catch (error) {
    console.error("❌ Erreur de connexion à Couchbase Capella :", error);
  }
})();
