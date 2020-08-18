const fs = require('fs');
const papa = require('papaparse');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;


const crypto = require('crypto');
const hash = (string) => {
  const hashResult = crypto
    .createHash('md5')
    .update(string.trim())
    .digest('hex');
  return hashResult;
};

const json2post = (item, venues) => {
  const post = document.createElement('div');
  post.setAttribute('data-venue', item[1]);
  venues.add(item[1]);
  if (item[4]) post.setAttribute('data-tags', item[4]);
  const id = hash(`${item[0]}${item[2]}`);
  post.id = 'post' + id;
  post.classList.add('post');
  document.getElementById('posts').append(post);

  const posttitle = document.createElement('h2');
  posttitle.classList.add('post__title');
  posttitle.innerHTML = item[2];
  post.appendChild(posttitle);

  const seminar = document.createElement('div');
  seminar.classList.add('post__seminar');
  seminar.innerHTML = item[1];
  post.appendChild(seminar);

  const postdate = document.createElement('div');
  postdate.classList.add('post__date');
  postdate.innerHTML = item[0];
  post.appendChild(postdate);

  const postbodywrapper = document.createElement('div');
  postbodywrapper.classList.add('post__bodywrapper');
  post.appendChild(postbodywrapper);

  const postbody = document.createElement('div');
  postbody.classList.add('post__body');
  postbody.innerHTML = item[3];
  postbodywrapper.appendChild(postbody);


  if (item[6] !== '') {
    const url = document.createElement('div');
    url.classList.add('post__url');
    const a = document.createElement('a');
    a.classList.add('post__url__link');
    a.href = item[6];
    a.innerHTML = 'Link to more info';
    url.appendChild(a);
    post.appendChild(url);
  }

  if (item[7] !== '') {
    const attachment = document.createElement('div');
    attachment.classList.add('post__attachment');
    const a = document.createElement('a');
    a.classList.add('post__attachment__link');
    a.href = item[7];
    if (item[7].includes('folder')) {
      a.innerHTML = 'View attachments';
    } else {
      a.innerHTML = 'View attachment';
    }
    attachment.appendChild(a);
    post.appendChild(attachment);
  }

  if (item[4] !== '') {
    const tags = document.createElement('div');
    tags.classList.add('post__tags');
    tags.innerHTML = 'Tagged: ' + item[4].replace(/,/g, ', ');
    post.appendChild(tags);
  }

  if (item[5]) {
    const eventdate = new Date(item[5]);
    const today = new Date();
    if (eventdate >= today) {
      const a = document.createElement('a');
      a.innerHTML = item[2];
      const id = hash(`${item[0]}${item[2]}`);
      a.href = '#' + 'post' + id;
      a.setAttribute(
        'data-startdate',
        eventdate.toISOString().substring(0, 10)
      );
      document.getElementById('conferences').append(a);
    }
  }
};


const dom = new JSDOM(fs.readFileSync('./template.html').toString());
const document = dom.window.document;

const csvString = fs.readFileSync('./sheet.csv').toString();

let json = papa.parse(csvString, { delimiter: ',' }).data;
json.shift();
const venues = new Set();
for (let key of Object.keys(json)) {
  json2post(json[key], venues);
}
const select = document.getElementById('venues');
[...venues].sort().forEach((venue) => {
  const option = document.createElement('option');
  option.setAttribute('value', venue);
  option.innerHTML = venue;
  select.appendChild(option);
});
const conferences_wrapper = document.getElementById('conferences');
const conferences = [...conferences_wrapper.querySelectorAll('a')];
conferences.sort(
  (a, b) => a.getAttribute('data-startdate') > b.getAttribute('data-startdate')
);
conferences.forEach((item) => conferences_wrapper.appendChild(item));

fs.writeFileSync('./index.html', dom.serialize());
