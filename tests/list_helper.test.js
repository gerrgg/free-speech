const listHelper = require("../utils/list_helper");

test("dummy returns one", () => {
  const blogs = [];

  const result = listHelper.dummy(blogs);
  expect(result).toBe(1);
});

describe("total likes", () => {
  const listWithOneBlog = [
    {
      _id: "5a422aa71b54a676234d17f8",
      title: "Go To Statement Considered Harmful",
      user: "Edsger W. Dijkstra",
      url:
        "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
      likes: 5,
      __v: 0,
    },
  ];

  test("when empty list likes is equal to zero", () => {
    expect(listHelper.totalLikes([])).toBe(0);
  });

  test("when list has only one blog, equals the likes of that", () => {
    const result = listHelper.totalLikes(listWithOneBlog);
    expect(result).toBe(5);
  });

  test("if bigger list is calculated correctly", () => {
    // essentailly double
    listWithOneBlog.push(listWithOneBlog[0]);
    expect(listHelper.totalLikes(listWithOneBlog)).toBe(10);
  });
});

describe("favorite blog", () => {
  const blogs = require("./blogs");

  test("should return null if given nothing", () => {
    expect(listHelper.favoriteBlog([])).toBe(null);
  });

  test("should return blog with highest likes", () => {
    let favorite = listHelper.favoriteBlog(blogs);
    expect(favorite.likes).toBe(12);
  });
});

describe("Most blogs", () => {
  const blogs = require("./blogs");

  test("should return null if given an empty array", () => {
    expect(listHelper.mostBlogs([])).toBe(null);
  });

  test("should return the user name with the most blogs", () => {
    expect(listHelper.mostBlogs(blogs)).toEqual({
      user: "Robert C. Martin",
      blogs: 3,
    });
  });
});

describe("Most Likes", () => {
  const blogs = require("./blogs");

  test("should return null if given an empty array", () => {
    expect(listHelper.mostLikes([])).toBe(null);
  });

  test("should return a formatted object with user and likes", () => {
    expect(listHelper.mostLikes(blogs)).toEqual({
      user: "Edsger W. Dijkstra",
      likes: 17,
    });
  });
});
