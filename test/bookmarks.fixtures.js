function makeBookmarksArray() {
    return [
        {
          title: 'Youtube',
          id: 1,
          url: 'http://www.youtube.com',
          rating: 4,
          description: 'Broadcast your life'
        },
        {
          title: 'Amazon',
          id: 2,
          url: 'http://www.amazon.com',
          rating: 1,
          description: 'For when you need to spend money on impulse items at 3 AM'
        },
        {
          title: 'Instagram',
          id: 3,
          url: 'http://www.instagram.com',
          rating: 3,
          description: "Pictures of cats and stuff"
        },
      ];
}


  module.exports = {
      makeBookmarksArray,
  }