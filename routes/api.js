const express = require('express');

const router = express.Router();

const apiController = require('../controllers/apiController');

// GET request on /posts for seeing all the posts
router.get('/posts', apiController.postsGET);

// GET request on /posts/:postId for seeing post with comments
router.get('/posts/:postId', apiController.postIdGET);

// POST request on /posts/:postId for making comment on post
router.post('/posts/:postId', apiController.commentCreatePOST);

// Admin Only

// POST request on /login for creating a bearer token
router.post('/login', apiController.loginPOST);

// GET request on /posts/admin for viewing all public/private posts
router.get('/posts/admin', apiController.adminPostsGET);

// POST request on /posts for making a new post
router.post('/posts', apiController.postCreatePOST);

// PUT request on /posts/:postId for editing a post
router.put('/posts/:postId', apiController.postEditPUT);

// DELETE request on /posts/:postId for deleting a post
router.delete('/posts/:postId', apiController.postDELETE);

// DELETE request on /posts/:postId/comments/:commentId for deleting a comment
router.delete('/posts/:postId/comments/:commentId', apiController.commentDELETE);

module.exports = router;
