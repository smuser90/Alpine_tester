exports.testObjects = [

  // * TIMELAPSE
  {
    name: 'Basic Timelapse',
    instructions: [{
      name: 'navigate home',
      command: ['navigate', 'home'],
      assertion: undefined,
      timeout: 30000
    }, {
      name: 'click new TL',
      command: ['click', '#newTimeLapse'],
      assertion: undefined,
      timeout: 30000
    }, {
      name: 'navigate to upload',
      command: ['navigate', '#timelapse/upload'],
      assertion: undefined,
      timeout: 30000
    }, {
      name: 'validate TL packet',
      command: ['click', '#timelapse'],
      assertion: 'valid_pkt',
      timeout: 30000
    }, {
      name: 'run TL',
      command: undefined,
      assertion: 'tl_stepping: Exit',
      timeout: 30000
    }, {
      name: 'wait...',
      command: ['wait', 15000],
      assertion: undefined,
      timeout: 30000
    }, {
      name: 'pause TL',
      command: ['click', '#stopTimelapse'],
      assertion: 'tl_paused: Entry',
      timeout: 30000
    }, {
      name: 'wait...',
      command: ['wait', 5000],
      assertion: undefined,
      timeout: 30000
    }, {
      name: 'resume TL',
      command: ['click', '#stopTimelapse'],
      assertion: 'tl_paused: Unpause',
      timeout: 30000
    }]
  },

  // * PHOTOS
  {
    name: 'Take Photos',
    instructions: [
      {
      name: 'detect photos',
      command: undefined,
      assertion: 'TL_StartPhoto',
      timeout: 30000
    }]
  },

  // * TOTAL PHOTOS
  // {
  //   name: 'Total Photos',
  //   instructions: [{
  //     name: 'verify total photos',
  //     command: ['query', { type: 'totalPhotos'}],
  //     assertion: 'TL_StartPhoto',
  //     timeout: 30000000
  //   }]
  // },

  // * CAMERA SETTINGS
  // {
  //   name: 'Verify Camera Settings',
  //   instructions: [{
  //     name: 'navigate to camera settings page',
  //     command: ['navigate', '#settings/camera'],
  //     assertion: undefined,
  //     timeout: 30000
  //   }, {
  //     name: 'verify shutter speed',
  //     command: ['camSetting', { setting: 'shutter', index: Math.floor(Math.random() * 1) + 10 }],
  //     assertion: 'Set Val :',
  //     timeout: 30000
  //   }, {
  //     name: 'verify aperture',
  //     command: ['camSetting', { setting: 'aperture', index: Math.floor(Math.random() * 1) + 5 }],
  //     assertion: 'Set Val :',
  //     timeout: 30000
  //   }, {
  //     name: 'verify iso',
  //     command: ['camSetting', { setting: 'iso', index: Math.floor(Math.random() * 3) + 7 }],
  //     assertion: 'Set Val :',
  //     timeout: 30000
  //   }]
  // },

  // * THUMBNAILS
  // {
  //   name: 'Verify Thumbnails',
  //   instructions: [{
  //     name: 'navigate to timelapse page',
  //     command: ['navigate', '#timelapse/upload'],
  //     assertion: undefined,
  //     timeout: 30000
  //   }, {
  //     name: 'request thumbnail',
  //     command: ['click', '.preview'],
  //     assertion: undefined,
  //     timeout: 30000
  //   }, {
  //     name: 'bypass thumbnail modal',
  //     command: ['click', '#get-thumb'],
  //     assertion: undefined,
  //     timeout: 30000
  //   }, {
  //     name: 'verify thumbnail request',
  //     command: undefined,
  //     assertion: 'usb_thumb: Init',
  //     timeout: 30000
  //   }, {
  //     name: 'check for valid thumbnail',
  //     command: ['verify_thumb'],
  //     assertion: undefined,
  //     timeout: 40000
  //   }]
  // },
];
