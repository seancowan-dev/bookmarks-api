function makeBookmarksArray() {
    return [
        {
          title: 'Youtube',
          id: 95,
          url: 'http://www.youtube.com',
          rating: "4",
          description: 'Broadcast your life'
        },
        {
          title: 'Amazon',
          id: 96,
          url: 'http://www.amazon.com',
          rating: "1",
          description: 'For when you need to spend money on impulse items at 3 AM'
        },
        {
          title: 'Instagram',
          id: 97,
          url: 'http://www.instagram.com',
          rating: "3",
          description: "Pictures of cats and stuff"
        },
      ];
}

function makeMaliciousBookmark() {
  const maliciousBookmark = {
    id: 911,
    rating: "4",
    url: 'http://www.xss.com',
    title: 'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
    description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`
  }
  const expectedBookmark = {
    ...maliciousBookmark,
    title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    description: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
  }
  return {
    maliciousBookmark,
    expectedBookmark,
  }
}

  module.exports = {
      makeBookmarksArray,
      makeMaliciousBookmark
  }