const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');

exports.postsGET = asyncHandler(async (req, res) => {
  const postList = await Post.find({ public: true }).sort({ date: -1 }).exec();

  res.json({ postList });
});

exports.postIdGET = asyncHandler(async (req, res) => {
  const [post, commentList] = await Promise.all([
    Post.findById(req.params.postId).exec(),
    Comment.find({ parent: req.params.postId }).sort({ date: -1 }).exec(),
  ]);

  res.json({
    post,
    commentList,
  });
});

exports.commentCreatePOST = [
  body('body')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Comment must not be empty')
    .isLength({ max: 280 })
    .withMessage('Comment must not contain more than 280 characters')
    .escape(),
  body('name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Name must not be empty')
    .isLength({ max: 32 })
    .withMessage('Name must not contain more than 32 characters')
    .escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        fields: {
          body: req.body.body,
          name: req.body.name,
        },
        errors: errors.array(),
      });
    }

    const post = await Post.findById(req.params.postId).exec();

    if (post === null) {
      return res.status(404).json({
        fields: {},
        errors: ['Post not found'],
      });
    }

    const comment = new Comment({
      body: req.body.body,
      author: req.body.name,
    });
    await comment.save();

    const commentList = await Comment.find({ parent: req.params.postId }).sort({ date: -1 }).exec();
    res.json({
      post,
      commentList,
    });
  }),
];

// Admin Only

function verifyToken(req, res, next) {
  // Get auth header value
  const bearerHeader = req.headers.authorization;
  // Check if bearer is undefined
  if (typeof bearerHeader !== 'undefined') {
    // Split at the space
    const bearer = bearerHeader.split(' ');
    // Get token from array
    const bearerToken = bearer[1];
    // Set the token
    req.token = bearerToken;
    next();
  } else {
    // Forbidden
    res.status(403).json({
      message: 'Forbidden',
    });
  }
}

exports.loginPOST = [
  body('username')
    .trim()
    .escape(),
  body('password')
    .trim()
    .escape(),

  asyncHandler(async (req, res) => {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res.status(404).json({
        message: 'Not found',
      });
    }
    if (user.password !== req.body.password) {
      return res.status(403).json({
        message: 'Forbidden',
      });
    }

    jwt.sign({ user }, process.env.SECRET_KEY, (err, token) => {
      res.json({
        token,
      });
    });
  }),
];

exports.postCreatePOST = [
  body('title')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Title must not be empty')
    .isLength({ max: 70 })
    .withMessage('Title must not contain more than 70 characters')
    .escape(),
  body('body')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Body must not be empty')
    .isLength({ max: 280 })
    .withMessage('Body must not contain more than 280 characters')
    .escape(),
  body('public')
    .isBoolean()
    .withMessage('Post must either be public or private')
    .escape(),

  asyncHandler(async (req, res) => {
    // Code to verify that user is admin
    await verifyToken();
    jwt.verify(req.token, process.env.SECRET_KEY, (err, authData) => {
      if (err) {
        return res.status(403).json({
          message: 'Forbidden',
        });
      }
    });

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        fields: {
          title: req.body.title,
          body: req.body.body,
          public: req.body.public,
        },
        errors: errors.array(),
      });
    }

    const post = new Post({
      title: req.body.title,
      body: req.body.body,
      public: req.body.public,
    });
    await post.save();
    res.json({ post });
  }),
];

exports.postEditPUT = [
  body('title')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Title must not be empty')
    .isLength({ max: 70 })
    .withMessage('Title must not contain more than 70 characters')
    .escape(),
  body('body')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Body must not be empty')
    .isLength({ max: 280 })
    .withMessage('Body must not contain more than 280 characters')
    .escape(),
  body('public')
    .isBoolean()
    .withMessage('Post must either be public or private')
    .escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        fields: {
          title: req.body.title,
          body: req.body.body,
          public: req.body.public,
        },
        errors: errors.array(),
      });
    }

    // Code to verify that user is admin
    await verifyToken();
    jwt.verify(req.token, process.env.SECRET_KEY, (err, authData) => {
      if (err) {
        return res.status(403).json({
          message: 'Forbidden',
        });
      }
    });

    const [post, commentList] = await Promise.all([
      Post.findById(req.params.postId).exec(),
      Comment.find({ parent: req.params.postId }).sort({ date: -1 }).exec(),
    ]);

    if (post === null) {
      return res.status(404).json({
        fields: {},
        errors: ['Post not found'],
      });
    }

    const updatedPost = new Post({
      title: req.body.title,
      body: req.body.body,
      date: post.date,
      public: req.body.public,
      _id: req.params.id,
    });

    await Post.findByIdAndUpdate(req.params.postId, updatedPost, {});
    res.json({
      post: updatedPost,
      commentList,
    });
  }),
];

exports.postDELETE = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId).exec();

  if (post === null) {
    return res.status(404).json({
      errors: ['Post not found'],
    });
  }

  // Code to verify that user is admin
  await verifyToken();
  jwt.verify(req.token, process.env.SECRET_KEY, (err, authData) => {
    if (err) {
      return res.status(403).json({
        message: 'Forbidden',
      });
    }
  });

  await Comment.deleteMany({ parent: req.params.postId });
  await Post.findByIdAndDelete(req.params.postId);

  res.json({
    post,
  });
});

exports.commentDELETE = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId).exec();

  if (comment === null) {
    return res.status(404).json({
      errors: ['Post not fouond'],
    });
  }

  await verifyToken();
  jwt.verify(req.token, process.env.SECRET_KEY, (err, authData) => {
    if (err) {
      return res.status(403).json({
        message: 'Forbidden',
      });
    }
  });

  await Comment.findByIdAndDelete(req.params.commentId);

  res.json({
    comment,
  });
});