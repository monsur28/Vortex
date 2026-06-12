import fs from 'fs';

const HOST = 'http://premiumtvs.space:80';
const USERNAME = '1Aoen7elp5';
const PASSWORD = 'IgMJ60tmAa';

async function fetchXtream() {
  console.log('Fetching live categories...');
  const catRes = await fetch(`${HOST}/player_api.php?username=${USERNAME}&password=${PASSWORD}&action=get_live_categories`);
  const categories = await catRes.json();
  
  console.log('Fetching live streams...');
  const streamRes = await fetch(`${HOST}/player_api.php?username=${USERNAME}&password=${PASSWORD}&action=get_live_streams`);
  const streams = await streamRes.json();
  
  console.log(`Found ${categories.length} categories and ${streams.length} streams.`);

  // Create a category map
  const catMap = {};
  categories.forEach(c => {
    catMap[c.category_id] = c.category_name;
  });

  // Convert to our channels.json format
  const formattedChannels = streams.map(s => {
    // Xtream Codes stream URL format with templated credentials
    const url = `{XTREAM_HOST}/live/{XTREAM_USER}/{XTREAM_PASS}/${s.stream_id}.ts`;
    return {
      name: s.name,
      logo: s.stream_icon || '',
      group: catMap[s.category_id] || 'Other',
      url: url
    };
  });

  fs.writeFileSync('data/xtream_all_channels.json', JSON.stringify(formattedChannels, null, 2));
  console.log(`Saved ${formattedChannels.length} channels to data/xtream_all_channels.json`);
  
  // Optionally filter for just sports/world cup
  const sportsChannels = formattedChannels.filter(c => {
    const name = c.name.toLowerCase();
    const group = c.group.toLowerCase();
    return group.includes('sport') || name.includes('fifa') || name.includes('world cup') || name.includes('tsn');
  });
  
  fs.writeFileSync('data/xtream_sports_channels.json', JSON.stringify(sportsChannels, null, 2));
  console.log(`Saved ${sportsChannels.length} sports channels to data/xtream_sports_channels.json`);
}

fetchXtream().catch(console.error);
