#!/usr/bin/env node
import inquirer from "inquirer";
import chalk from "chalk";
const fetchQuizData = async (amount, category, difficulty) => {
    let categoryData = await categories();
    let categoryIndex = categoryData.find(data => data.name == category);
    try {
        let response = await fetch(`https://opentdb.com/api.php?amount=${amount}&category=${categoryIndex?.id}&difficulty=${difficulty}`);
        if (!response.ok) {
            throw new Error("Failed to fetch questions");
        }
        const { results } = await response.json();
        return results;
    }
    catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
};
const categories = async () => {
    const res = await fetch("https://opentdb.com/api_category.php");
    let { trivia_categories } = await res.json();
    const data = trivia_categories.map((data) => {
        return {
            id: data.id,
            name: data.name,
        };
    });
    return data;
};
class MyQuiz {
    questions = [];
    score = 0;
    async startQuiz() {
        console.log(chalk.yellow("Welcome to the Ultimate Quiz App"));
        console.log(chalk.yellow("Select your ultimate quiz and test your knowledge"));
        let category = await categories();
        let userSelection = await inquirer.prompt([{ name: "totalQuestion", message: chalk.bold("Select how much question you want"), type: "list", choices: ["5", "10", "15", "20", "25", "30"] }, { name: "category", message: chalk.bold("Select category you want"), type: "list", choices: category.map(categoryName => categoryName) }, { name: "difficulty", message: chalk.bold("Select difficulty level"), type: "list", choices: ["easy", "meduim", "hard"] }]);
        this.questions = await fetchQuizData(userSelection.totalQuestion, userSelection.category, userSelection.difficulty);
        this.chooseOptions();
    }
    async chooseOptions() {
        if (this.questions.length != 0) {
            let showOptions = await inquirer.prompt(this.questions.map((data) => {
                let randomIndex = Math.floor(Math.random() * data.incorrect_answers.length + 1);
                let copyIncorrectOptions = data.incorrect_answers;
                copyIncorrectOptions.splice(randomIndex, 0, data.correct_answer);
                return {
                    name: data.question, message: chalk.bold(data.question), type: "list", choices: copyIncorrectOptions.map(elem => elem)
                };
            }));
            this.checkScore(showOptions);
        }
        else {
            console.log(chalk.red("Please add questions first"));
        }
    }
    async checkScore(showOptions) {
        for (let i = 0; i < this.questions.length; i++) {
            let name = this.questions[i].question;
            if (showOptions[name] == this.questions[i].correct_answer) {
                let newScore = this.score += 1;
                this.score = newScore;
            }
        }
        if (this.score === this.questions.length) {
            console.log(chalk.green(`Huge congratulations\nYou passed the quiz with all points\n${this.score}/${this.questions.length}`));
        }
        else if (this.score >= this.questions.length / 2) {
            console.log(chalk.green(`congratulations\nYou passed the quiz\n${this.score}/${this.questions.length}`));
        }
        else {
            console.log(chalk.red(`Better luck next time\nTotal Points:${this.score}/${this.questions.length}`));
        }
    }
}
let startQuiz = new MyQuiz();
startQuiz.startQuiz();
