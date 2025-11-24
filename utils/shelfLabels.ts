/**
 * Mapeo de códigos de estantería a etiquetas según el mapeo en DepositMap.tsx
 * 
 * Mapeo:
 * - 1-4: Estante A1, A2, A3, A4
 * - 5-8: Estante B1, B2, B3, B4
 * - 9-12: Estante C1, C2, C3, C4
 * - 13-16: Estante D1, D2, D3, D4
 * - 17-20: Estante E1, E2, E3, E4
 * - 21-24: Estante F1, F2, F3, F4
 * - 25-27: Estante G1, G2, G3
 * - 28-30: Mesa MT-1, Mesa MT-2, Mesa MT-3
 */

export function getShelfLabel(shelfCode: number | string | null | undefined): string {
  if (shelfCode == null) return "Estantería";
  
  const code = typeof shelfCode === "string" ? Number(shelfCode) : shelfCode;
  
  if (Number.isNaN(code) || code < 1 || code > 30) {
    return `Estantería ${code}`;
  }

  // Estantes A (1-4)
  if (code >= 1 && code <= 4) {
    const level = code; // 1->A1, 2->A2, 3->A3, 4->A4
    return `Estante A${level}`;
  }

  // Estantes B (5-8)
  if (code >= 5 && code <= 8) {
    const level = code - 4; // 5->B1, 6->B2, 7->B3, 8->B4
    return `Estante B${level}`;
  }

  // Estantes C (9-12)
  if (code >= 9 && code <= 12) {
    const level = code - 8; // 9->1, 10->2, 11->3, 12->4
    return `Estante C${level}`;
  }

  // Estantes D (13-16)
  if (code >= 13 && code <= 16) {
    const level = code - 12; // 13->1, 14->2, 15->3, 16->4
    return `Estante D${level}`;
  }

  // Estantes E (17-20)
  if (code >= 17 && code <= 20) {
    const level = code - 16; // 17->1, 18->2, 19->3, 20->4
    return `Estante E${level}`;
  }

  // Estantes F (21-24)
  if (code >= 21 && code <= 24) {
    const level = code - 20; // 21->1, 22->2, 23->3, 24->4
    return `Estante F${level}`;
  }

  // Estantes G (25-27)
  if (code >= 25 && code <= 27) {
    const level = code - 24; // 25->1, 26->2, 27->3
    return `Estante G${level}`;
  }

  // Mesas (28-30)
  if (code >= 28 && code <= 30) {
    const mesaNum = code - 27; // 28->1, 29->2, 30->3
    return `Mesa MT-${mesaNum}`;
  }

  return `Estantería ${code}`;
}

/**
 * Obtiene solo el nombre corto de la estantería (sin "Estante" o "Mesa")
 * Ejemplo: "A1", "B2", "MT-1"
 */
export function getShelfShortLabel(shelfCode: number | string | null | undefined): string {
  const fullLabel = getShelfLabel(shelfCode);
  
  // Extraer la parte después de "Estante " o "Mesa "
  if (fullLabel.startsWith("Estante ")) {
    return fullLabel.replace("Estante ", "");
  }
  if (fullLabel.startsWith("Mesa ")) {
    return fullLabel.replace("Mesa ", "");
  }
  
  return fullLabel;
}

