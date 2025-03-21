require('dotenv').config();
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const logger = require('./logger');
const playerService = require('./playerService'); 

const PROTO_PATH = path.join(__dirname, 'protos', 'player.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const playerProto = grpc.loadPackageDefinition(packageDefinition).player;

function main() {
  const server = new grpc.Server();

  server.addService(playerProto.PlayerService.service, {
    FindPlayers: playerService.FindPlayers,
    CreatePlayer: playerService.CreatePlayer,
    AddAchievement: playerService.AddAchievement,
    DeletePlayerById: playerService.DeletePlayerById,
    UpdateProfile: playerService.UpdateProfile,
    UpdateEmail: playerService.UpdateEmail,
    UpdatePassword: playerService.UpdatePassword,
    UpdateScore: playerService.UpdateScore,
    UpdateStats: playerService.UpdateStats,
    UpdateMainFaction: playerService.UpdateMainFaction,
    UpdateMedia: playerService.UpdateMedia,
    Login: playerService.Login
  });

  const address = '0.0.0.0:5000';
  server.bindAsync(address, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      logger.error(`Error binding server: ${err.message}`);
      return;
    }
    logger.info(`gRPC server running at ${address}`);
    server.start();
  });
}

main();