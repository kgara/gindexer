export default () => ({
  rpcEndpoint:
    'https://clean-wispy-patina.quiknode.pro/2cb94ec5dde2430734ce8095f00004a987914178/',
  contractAddress: '0x3a23F943181408EAC424116Af7b7790c94Cb97a5',
  apiServer: {
    port: 3000,
  },
  rabbitMQ: {
    url: 'amqp://localhost:5672',
    queue: 'bridge-events',
  },
});
