export default {
  commands: {
    startServer: "ngrok-client.startServer",
    stopServer: "ngrok-client.stopServer",
    toggle: "ngrok-client.toggle"
  },
  tunnelApi: "http://localhost:4040/api/tunnels",
  statusBarStartText: `$(circle-slash) stop ngrok server`,
  statusBarStopText: `$(globe) start ngrok server`
};
