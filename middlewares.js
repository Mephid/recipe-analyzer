const axios = require("axios");

//Retrieve single ingredient throug API call
async function retrieveIngredient(req, res, next) {
  if (!req.body.ingredient) {
    console.log("Insert ingredient");
    req.session.ingredientError = true;
  } else {
    await axios
      .get(
        `https://api.edamam.com/api/nutrition-data?app_id=${process.env.EDAMAM_APP_ID}&app_key=${process.env.EDAMAM_APP_KEY}&ingr=${req.body.ingredient}`
      )
      .then((response) => {
        try {
          let data = response.data.ingredients[0].parsed[0];
          if (data) {
            if (!data.measure) {
              throw error;
            }

            if (!req.session.ingrList) {
              req.session.ingrList = [];
              req.session.ingredientError = false;
            }
            req.session.ingrList.push(
              `${data.quantity} ${
                data.measure === "whole" ? "" : data.measure
              } ${data.foodMatch}`
            );
            req.session.ingredientError = false;
          }
        } catch (error) {
          req.session.ingredientError = true;
          throw "Invalid submission";
        }
      })
      .catch((err) => console.error("Please review ingredient", err));
  }
  next();
}

//Submit recipe and get response back with statistics
async function submitRecipe(req, res, next) {
  if (!req.session.ingrList || !req.session.ingrList[0]) {
    console.log("Please add ingredients");
  } else {
    await axios
      .post(
        `https://api.edamam.com/api/nutrition-details?app_id=${process.env.EDAMAM_APP_ID}&app_key=${process.env.EDAMAM_APP_KEY}`,
        {
          title: "recipe_" + Date.now(),
          ingr: req.session.ingrList,
        },
        { headers: { "content-type": "application/json" } }
      )
      .then((response) => {
        req.session.recipeSubmitted = true;
        req.session.weight = Math.round(Number(response.data.totalWeight));
        console.log(req.session.weight);
        req.session.totalNutrients = {};
        for (let obj of Object.values(response.data.totalNutrients)) {
          req.session.totalNutrients[obj.label] = `${Math.round(
            Number(obj.quantity)
          )}${obj.unit}`;
        }
      })
      .catch((err) =>
        console.log("An error as occurred. Please review ingredient list", err)
      );
  }
  next();
}

//Values to be displayed
function dynamicContent(req, res, next) {
  if (req.session.recipeSubmitted) {
    req.session.stats_totalNutrients = {
      Calories: req.session.totalNutrients.Energy,
      "Total Fat": req.session.totalNutrients.Fat,
      "Saturated Fat": req.session.totalNutrients.Saturated,
      "Trans Fat": req.session.totalNutrients.Trans,
      Cholesterol: req.session.totalNutrients.Cholesterol,
      Sodium: req.session.totalNutrients.Sodium,
      "Total Carbohydrate": req.session.totalNutrients.Carbs,
      "Dietary Fiber": req.session.totalNutrients.Fiber,
      Sugars: req.session.totalNutrients.Sugars,
      Protein: req.session.totalNutrients.Protein,
    };
  } else {
    req.session.stats_totalNutrients = "";
    req.session.weight = 0;
  }

  next();
}

module.exports = {
  retrieveIngredient: retrieveIngredient,
  submitRecipe: submitRecipe,
  dynamicContent: dynamicContent,
};
