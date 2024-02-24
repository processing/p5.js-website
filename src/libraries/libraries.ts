import type { Libraries } from './types';

export const libraries: Libraries = {
  categories: [
    {
      name: {
        en: 'Drawing'
      },
      libraries: []
    },

    {
      name: {
        en: 'Color'
      },
      libraries: []
    },

    {
      name: {
        en: 'User Interface'
      },
      libraries: []
    },

    {
      name: {
        en: 'Math'
      },
      libraries: []
    },

    {
      name: {
        en: 'Physics'
      },
      libraries: []
    },

    {
      name: {
        en: 'Algorithms'
      },
      libraries: []
    },

    {
      name: {
        en: '3D'
      },
      libraries: [
        {
          name: 'p5.warp',
          description: {
            en: 'Fast 3D domain warping using shaders.'
          },
          author: 'Dave Pagurek',
          authorLink: 'https://www.davepagurek.com/',
          source: 'https://github.com/davepagurek/p5.warp',
          npm: '@davepagurek/p5.warp',
          img: {
            file: 'p5.warp.png',
            alt: {
              en: 'Four images of a 3D airplane twisting upside-down'
            }
          }
        }
      ]
    },

    {
      name: {
        en: 'AI, ML, Computer Vision'
      },
      libraries: []
    },

    {
      name: {
        en: 'Animation'
      },
      libraries: []
    },

    {
      name: {
        en: 'Filters'
      },
      libraries: []
    },

    {
      name: {
        en: 'Language'
      },
      libraries: []
    },

    {
      name: {
        en: 'Hardware'
      },
      libraries: []
    },

    {
      name: {
        en: 'Sound'
      },
      libraries: []
    },

    {
      name: {
        en: 'Data'
      },
      libraries: []
    },

    {
      name: {
        en: 'Networking'
      },
      libraries: []
    },

    {
      name: {
        en: 'Export'
      },
      libraries: []
    },

    {
      name: {
        en: 'Integrations'
      },
      libraries: []
    },

    {
      name: {
        en: 'Utilities'
      },
      libraries: []
    },
  ]
};
