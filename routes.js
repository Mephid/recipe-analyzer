const express = require('express');
const router = express.Router();
const { retrieveIngredient, submitRecipe, dynamicContent } = require('./middlewares')

//Index render
router.get('/', dynamicContent, (req, res) => {    
    res.render('index', {
        ingr: req.session.ingrList, 
        weight: req.session.weight,
        totalNutrients: req.session.stats_totalNutrients,
        ingredientError: req.session.ingredientError,
        recipeError: false
    })
})

//Post ingredient
router.post("/add_ingredient", retrieveIngredient, (req, res) => {
    res.redirect('/')
})

//Delete ingredient
router.get("/delete/:id", (req, res) => {
    req.session.ingrList.splice(req.params.id, 1)
    res.redirect('/')
})

//Submit recipe
router.get("/submit_recipe", submitRecipe, (req, res) => {
    res.redirect('/')
})

//Clear list
router.get("/clear_list", (req, res) => {
    req.session.ingrList = []
    res.redirect('/')
}) 

module.exports = router;