const url = 'http://localhost:3000/all_posts';
const postsContainer = document.getElementById('posts-container');

const displayPosts = (postsArray) => {
  postsArray.forEach(post => {
    const postDiv = document.createElement('div');
    postDiv.classList.add('post');
    const img = document.createElement('img');
    img.src = 'images/default.jpg';
    postDiv.appendChild(img);
    const postBody = document.createElement('div');
    postBody.classList.add('post-body');
    const h3 = document.createElement('h3');
    h3.innerText = post.author;
    const small = document.createElement('small');
    small.innerText = post.date;
    const p = document.createElement('p');
    p.innerText = post.body;
    postBody.appendChild(h3);
    postBody.appendChild(small);
    postBody.appendChild(p);
    postDiv.appendChild(postBody);
    postsContainer.appendChild(postDiv);
  });
};

if(postsContainer) {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if(xhr.readyState === XMLHttpRequest.DONE) {
      if(xhr.status === 200) {
        const posts = JSON.parse(xhr.response).reverse();
        const first20Posts = posts.slice(0, 19);
        displayPosts(first20Posts);
      } else {
        console.log('error');
      }
    }
  };

  xhr.open('GET', url);
  xhr.send();
}


