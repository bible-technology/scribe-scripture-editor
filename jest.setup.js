// Setup file to mock the canvas native module so jest can run on Node 24
// where the prebuilt canvas.node (compiled for NODE_MODULE_VERSION 109) is incompatible.
// This is a pre-existing environment issue, not caused by any code change.
jest.mock('canvas', () => ({
  createCanvas: (width, height) => {
    const mock = {
      width,
      height,
      getContext: () => ({
        clearRect: () => {},
        drawImage: () => {},
        fillRect: () => {},
        putImageData: () => {},
        getImageData: () => ({ data: new Uint8ClampedArray(width * height * 4) }),
      }),
      toDataURL: () => 'data:image/png;base64,AAAAAAAA',
    };
    return mock;
  },
}));
