const bookmark = type => {
  const title = document.title;
  const tokens = title.split(' - ');

  const pathname = window.location.pathname;
  const ids = pathname.substring(1).split('/');

  const urls = pathname.substring(1).split('/');
  urls.shift();

  let url = '';
  let data = {};
  if (type == 1) {
    url = '/bookmarks/set';
    data = {
      title: escape(tokens[0] + ' - ' + tokens[1]),
      url: escape(urls.join('/'))
    };
  } else {
    url = '/bookmarks/del';
  }

  data.id = ids[1] + '-' + ids[2];

  $.ajax({
    type: 'POST',
    url,
    data,
    success: data => {
      data = JSON.parse(data);

      switch (data.status) {
        case 0:
          alert('Järjehoidja lisatud!');
          $('#add-bookmark').attr('onclick', 'bookmark(0)');
          $('#add-bookmark').attr('id', 'remove-bookmark');
          $('#bookmark-icon').text('bookmark');
          break;
        case 1:
          alert('Järjehoidja eemaldatud!');
          $('#remove-bookmark').attr('onclick', 'bookmark(1)');
          $('#remove-bookmark').attr('id', 'add-bookmark');
          $('#bookmark-icon').text('bookmark_border');
          break;
        case -1:
          alert('Järjehoidja on juba olemas!');
          break;
        case -2:
          alert('Parameetrid puuduvad!');
          break;
        case -3:
          alert('Järjehoidjat ei leitud!');
          break;
      }
    }
  });
};

// /bookmarks/set?id=<%= selectedTopic.id %>-<%= selectedField.id %>&title=<%= escape((selectedField ? selectedField.title + ' - ' : '') + (selectedTopic ? selectedTopic.title: '')) %>&url=<%= escape(pathname) %>
