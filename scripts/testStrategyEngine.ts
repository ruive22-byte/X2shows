import { AdvancedPlayerStrategyEngine } from '../src/services/resolvers/AdvancedPlayerStrategyEngine';

async function run() {
  console.log("=== EXECUTING TRACE 1 SIMULATION (1shows) ===");
  await AdvancedPlayerStrategyEngine.execute({
    providerId: 'www.1shows.org',
    mediaId: '15260',
    serverClusters: ['macdn.hakunaymatata.com']
  });

  console.log("=== EXECUTING TRACE 2 SIMULATION (nightflix) ===");
  await AdvancedPlayerStrategyEngine.execute({
    providerId: 'nightflix.us',
    mediaId: '15260',
    serverClusters: ['moon.ironwallnet.net', 'hiddenmesa.top']
  });
}

run();
