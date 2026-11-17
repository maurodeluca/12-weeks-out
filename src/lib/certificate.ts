/** Generates and downloads a "challenge complete" certificate as a PNG, matching the app's theme. */
export async function downloadCertificate(name: string, totalMi: number, totalReps: number): Promise<void> {
  const canvas = document.createElement('canvas');
  canvas.width = 1400;
  canvas.height = 990;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  await loadFonts();

  // Background + double gold border frame.
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#ffd83a';
  ctx.lineWidth = 10;
  ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);
  ctx.lineWidth = 2;
  ctx.strokeRect(55, 55, canvas.width - 110, canvas.height - 110);

  ctx.textAlign = 'center';
  const cx = canvas.width / 2;

  ctx.fillStyle = '#ffd83a';
  ctx.font = '44px Oswald, sans-serif';
  ctx.fillText('FLUTTER GYM PROGRAMME', cx, 165);

  ctx.font = '110px "Black Ops One", sans-serif';
  ctx.fillText('12 WEEKS OUT', cx, 285);

  ctx.fillStyle = '#f2f2f2';
  ctx.font = '32px Oswald, sans-serif';
  ctx.fillText('CERTIFICATE OF COMPLETION', cx, 345);

  ctx.fillStyle = '#ffd83a';
  ctx.font = '72px "Black Ops One", sans-serif';
  ctx.fillText((name || 'Unknown Soldier').toUpperCase(), cx, 470);

  ctx.fillStyle = '#f2f2f2';
  ctx.font = '30px Oswald, sans-serif';
  ctx.fillText('has completed all 12 weeks of the challenge.', cx, 525);
  ctx.fillText(
    `${Math.round(totalMi).toLocaleString('en-IE')} miles logged \u00b7 ${Math.round(totalReps).toLocaleString('en-IE')} reps`,
    cx,
    570,
  );

  ctx.fillStyle = '#ffd83a';
  ctx.font = '56px "Black Ops One", sans-serif';
  ctx.fillText('CHAMPION', cx, 690);

  ctx.fillStyle = '#9a9a9a';
  ctx.font = '24px Oswald, sans-serif';
  ctx.fillText('14 Sept \u2013 11 Dec 2026 \u00b7 Flutter Dublin', cx, 910);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '12-weeks-out-certificate.png';
  a.click();
  URL.revokeObjectURL(url);
}

async function loadFonts(): Promise<void> {
  try {
    await Promise.all([
      document.fonts.load('400 72px "Black Ops One"'),
      document.fonts.load('400 32px "Oswald"'),
    ]);
  } catch {
    // Fall back to default canvas fonts if the webfonts aren't ready yet.
  }
}
