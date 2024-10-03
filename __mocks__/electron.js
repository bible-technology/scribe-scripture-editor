export const electron = {
  require: jest.fn(),
  match: jest.fn(),
  app: jest.fn(),
  shell: jest.fn(),
  dialog: jest.fn(),
  path: jest.fn(),
  getPath: jest.fn(),
};

export const remote = {
  app: {
    // replace the showOpenDialog function with a spy which returns a value
    getAppPath: jest
      .fn()
      .mockReturnValue("/home/asherphilip/Documents/Autographa_New/AG"),
  },
};

// for the shell module above
export const shell = {
  openExternal: jest.fn(),
};
