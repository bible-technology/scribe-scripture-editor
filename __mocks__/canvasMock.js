// Mock for the canvas native module so jest can run on Node 24
// where the prebuilt canvas.node (compiled for NODE_MODULE_VERSION 109) is incompatible.
// This is a pre-existing environment issue, not caused by any code change.
module.exports = {
  createCanvas: function (width, height) {
    const mock = {
      width,
      height,
      getContext: function () {
        return {
          clearRect: function () {},
          drawImage: function () {},
          fillRect: function () {},
          putImageData: function () {},
          getImageData: function () {
            return { data: new Uint8ClampedArray(width * height * 4) };
          },
        };
      },
      toDataURL: function () {
        return 'data:image/png;base64,AAAAAAAA';
      },
    };
    return mock;
  },
};
