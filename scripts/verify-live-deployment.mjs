async function testLive() {
  const res = await fetch('https://terms-audit-desk-genlayer.vercel.app');
  const html = await res.text();
  console.log('HTML status:', res.status);
  const m = html.match(/assets\/index-[^"']+\.js/);
  if (!m) {
    console.error('index js not found in html');
    process.exit(1);
  }
  const jsUrl = 'https://terms-audit-desk-genlayer.vercel.app/' + m[0];
  console.log('Fetching JS bundle:', jsUrl);
  const jsRes = await fetch(jsUrl);
  const js = await jsRes.text();
  console.log('Bundle length:', js.length);
  const hasContract = js.includes('0xfC2d4d29b46f44A6f4d09496451ff662dA8b4d33');
  const hasConsumer = js.includes('0xE8424C568FCB418fBAD5D272470f9A9fD6452860');
  const hasChain = js.includes('61999') || js.includes('0xF22F');
  console.log('Contains contract 0xfC2d4d29b46f44A6f4d09496451ff662dA8b4d33:', hasContract);
  console.log('Contains consumer 0xE8424C568FCB418fBAD5D272470f9A9fD6452860:', hasConsumer);
  console.log('Contains chain 61999 / 0xF22F:', hasChain);

  if (!hasContract || !hasConsumer || !hasChain) {
    console.error('VERIFICATION FAILED');
    process.exit(1);
  }
  console.log('=== LIVE BUNDLE VERIFIED SUCCESSFULLY ===');
}

testLive();
