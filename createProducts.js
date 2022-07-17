const { faker } = require("@faker-js/faker");
const Product = require("./models/Product");
const numberOfProduct = 20;
require("./mongoose");

const createProduct = async () => {
  console.log("create some fake products");
  let singleProduct;
  let created;
  const categoryArray = ["bike", "shoe", "tower", "shirt", "cheese"];
  const genderArray = ["men", "women", "kids"];
  try {
    for (let index = 0; index < numberOfProduct; index++) {
      singleProduct = {
        name: faker.commerce.product(),
        price: parseInt(faker.commerce.price()),
        stock: Math.ceil(Math.random() * 100),
        cover: faker.image.image(),
        category:
          categoryArray[Math.floor(Math.random() * categoryArray.length)],
        gender: genderArray[Math.floor(Math.random() * genderArray.length)],
        description: faker.commerce.productDescription()
      };
      console.log("singleProduct", singleProduct);
      created = await Product.create(singleProduct);
    }
  } catch (error) {
    console.log("error", error);
  }
  console.log("create fake products successfully");
  console.log("==============");
};
createProduct();
module.exports = createProduct;
