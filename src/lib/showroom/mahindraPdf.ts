import { mahindra8000, manufacturerSource, capabilities } from "./mahindra8000";

export async function downloadMahindraRecap(uses: string[], message = "", name = "") {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  let y = 22;
  const write = (text: string, size = 11) => {
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, 170);
    if (y + lines.length * 6 > 276) { doc.addPage(); y = 22; }
    doc.text(lines, 20, y); y += lines.length * 6 + 5;
  };
  write("LD AZOUAOU", 20); write(`${mahindra8000.name} - Fiche de projet`, 16);
  write(`Date : ${new Date().toLocaleDateString("fr-FR")}`);
  if (name) write(`Client : ${name}`);
  write(`Usages envisages : ${uses.length ? uses.join(", ") : "A preciser avec la concession"}`);
  write("Aucune option commerciale selectionnee. Les usages ne constituent pas des equipements inclus.");
  for (const feature of capabilities) write(`${feature.label} : ${feature.metric}\n${feature.description}`);
  if (message.trim()) write(`Votre besoin : ${message.trim()}`);
  write("Caracteristiques de la version 8000 4WD : a confirmer sur l'offre et la machine livree. Capacite de relevage nominale ; compatibilite des outils et conditions de securite a valider.");
  write(`Source constructeur : ${manufacturerSource}`, 9);
  write("Document de preparation uniquement : ni devis, ni demande envoyee.", 10);
  doc.save("mahindra-8000-fiche-projet.pdf");
}