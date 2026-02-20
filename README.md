# ml-tutorials
Everything to learn about machine learning



# Semiotics

Before we dive deep into the world of machine learning, let's start with a fundamental concept: Semiotics. What is it? Simply put, it's the study of signs and symbols and their use or interpretation. In our journey, we'll see how we use symbols, in our case, numbers, to represent and understand the world around us. This is the very foundation upon which machine learning is built.


## Numbers
### What do they represent 
Numbers are a way to measure unit. Whether it's the number of apples in a basket, the temperature outside, or the price of a stock, numbers give us a standardized way to quantify and compare things. They are the language we use to describe the world.


# Yuhoo ! We Invented Numbers [Number-System]

And because we needed to count and measure everything, we invented number systems! From the simple counting numbers we learn as kids, to integers that include negative values, to rational numbers for fractions, and even complex numbers. Each system gives us more power to describe more complex phenomena. Think of it as upgrading our language to have more words and express more nuanced ideas.


# Visualising Numbers

But just having numbers isn't enough. Our brains are visual. We need to *see* the numbers to understand them better. And that's where visualization comes in.

## We Invented Number Line

First up, we invented the number line. A simple, yet powerful tool. It gives us a way to place every number in order, to see how far apart they are, and to understand their magnitude. It’s our first step in turning abstract numbers into something concrete.


Sets of Numbers have specific properties [Statistics]

When we have a lot of numbers, a simple number line can get crowded. We started noticing that sets of numbers have specific properties. This is the birthplace of statistics! We can talk about the average (mean), the middle value (median), or the most frequent number (mode). We can also see how spread out our numbers are. These properties give us a summary of our data, a high-level view.


## We Invented 2D Grid System

[Cordinate-Geometry]

But what if we want to compare two different things at once? Like the height and weight of a person? For that, we invented the 2D grid system, also known as the Cartesian coordinate system. With an x-axis and a y-axis, we can plot points that represent two related numbers. Suddenly, we can see relationships, patterns, and trends that were invisible before.

## We Invented 3D World

And why stop at two dimensions? We live in a 3D world! By adding a third axis, the z-axis, we can represent data with three features. This allows us to visualize even more complex relationships and is a stepping stone to understanding that in machine learning, we often work with data in hundreds or even thousands of dimensions, even if we can't directly visualize it.


# Now Let's talk about relationships in these Numbers

Now that we have ways to represent and visualize numbers, we can start asking the really interesting questions. How are these numbers related? If one number changes, how does it affect another? This is the heart of machine learning: finding and understanding the relationships and patterns in data.

## We invented Functions [Functions]

To formally describe these relationships, we invented functions! A function is like a machine. You give it an input, and it gives you back an output. It's a rule that defines a relationship between two sets of numbers. For every input, there is a single, predictable output.

Think about converting temperature from Celsius to Fahrenheit. There's a specific formula for that: multiply by 9/5 and add 32. That's a function! The input is the temperature in Celsius, and the output is the temperature in Fahrenheit.

In machine learning, we often try to find the function that describes the relationship between our data. We might not know the exact rule, but we can use the data to learn an approximation of it. This learned function can then be used to make predictions on new, unseen data.


1. Algebra , variables are nothing but placeholders
2. Mapping , Function , Transformations ->
    Visualizing ND tuples
    Linear / Non-Linear Transformation
3. Matrices 
4. 3rd Video about visualization of data points
5. Calculus 
6. Coding Linear regression
7. Gradient descent
8. Polynomial Fitting Problem + Feature Enginering 
9. Scaling of data is important -> and it's impact on countur plots and convergence
10. Data clean up task.
11. How to avoid Feature Engineering yourself. 
12. Non-linear Activation Functions. 
13. UAT [ Universal Approximation Theorem ] and intution of lego blocks 
14. Categorical Data Set. Just talk about data and example of occurance
15. Probability , sigmoid , softmax 
16. Defining Classification problem and logistic regression. 
17. Multi Variable classification problem. 
18. Jumping to what is english and developing the intution can a machine ever learn to speak ?
19. What are different types of encoding -> one hot encoding , word2vec , vector embeddings like BERT etc. 
20. 



<!-- 
# Calculus: The Study of Change

So we have functions. But how do we find the *best* function for our data? What does "best" even mean? Usually, it means the function that makes the fewest mistakes. We can create another function—an "error function"—that measures how wrong our predictions are. Our goal is to find the input to this error function that gives us the smallest possible error.

This is where Calculus comes in! Calculus is the mathematics of change.

### The Rate of Change (Differentiation)

One of the key ideas in calculus is finding the rate of change of a function at any point. This is called the derivative. Think of it as looking at a curve and finding the slope or steepness at a specific spot.

Why is this useful? Well, imagine our error function is shaped like a big valley. We want to find the very bottom of that valley, because that's the point of lowest error. At the exact bottom, the slope is zero—it's perfectly flat.

So, by calculating the derivative of our error function, we can find the point where the slope is zero. This tells us we've found the bottom of the valley, the point of minimum error. This process, called optimization, is fundamental to how machines learn. They are constantly adjusting their internal parameters to find the bottom of that error valley.

# Linear Algebra: The Language of Data

Okay, we have a way to find the best function to minimize our errors. But what does our data actually *look* like? We mentioned working with data in hundreds or thousands of dimensions. How do we even begin to handle that? We can't just write down a thousand numbers in a single line.

This is where Linear Algebra comes to the rescue. It is the language of data. It gives us the tools and structures to work with these massive, high-dimensional datasets efficiently.

### Vectors: Our Data Points

Remember plotting a point on a 2D grid? That point, represented by its coordinates (x, y), is a vector! A vector is just a list of numbers. Each number represents a different feature or dimension of our data. So, if we are describing a house, a vector might contain its size, number of bedrooms, age, and price. It's a single, self-contained package representing one data point.

### Matrices: Our Datasets

Now, what if we have data for a thousand houses? We would have a thousand of these vectors. We can stack all of these vectors together to form a grid, or a table, of numbers. This is a matrix! A matrix is just a collection of vectors. The entire dataset, with all its features and all its examples, can be represented as one giant matrix.

By organizing our data into vectors and matrices, we can use the powerful tools of linear algebra to perform calculations on the entire dataset at once. This is incredibly efficient and is the reason why modern machine learning frameworks can handle such enormous amounts of data.

# Probability & Statistics: Dealing with Uncertainty

So we have our data organized, and we have the tools to find patterns in it. But there's a catch. The real world is messy. Data is almost never perfect. There's always some noise, some randomness. If we build a model to predict house prices, we're never going to be 100% accurate every single time.

So how do we deal with this uncertainty? This is where Probability and Statistics come in.

Probability is the mathematics of uncertainty. It gives us a way to quantify how likely something is to happen. We can't say for sure what a house will sell for, but we can say there's a 90% chance it will sell for between X and Y.

Statistics then gives us the tools to analyze our data and make inferences in the face of this uncertainty. It helps us understand the distribution of our data, to identify what's a real pattern and what's just random noise. It allows us to say how confident we are in our conclusions. When a machine learning model makes a prediction, it's often also giving a probability, a measure of its confidence. This is crucial for making informed decisions.

# Machine Learning: Putting It All Together

And here we are. We've covered a lot of ground. We started with the basic idea of using numbers to represent the world. We learned about functions to describe the relationships between those numbers. We saw how calculus lets us find the best possible function by finding the minimum error. We learned how linear algebra gives us the power to handle huge amounts of data. And finally, we saw how probability and statistics help us deal with the uncertainty inherent in that data.

When you put all of these pieces together, you get Machine Learning.

Machine learning is the science of getting computers to learn and act like humans do, and improve their learning over time in an autonomous fashion, by feeding them data and information in the form of observations and real-world interactions.

It's about:
1.  Representing your data using **Linear Algebra** (vectors and matrices).
2.  Assuming there's a relationship between your data points, which can be described by a **Function**.
3.  Using **Calculus** to find the optimal version of that function that minimizes the prediction error.
4.  Using **Probability and Statistics** to quantify how confident you are in your results.

So, when you hear about a complex algorithm learning to identify cats in images, or predict the stock market, or translate languages, what it's really doing is applying these fundamental mathematical concepts at a massive scale. It's a testament to the power of these ideas that we've been building for centuries.

And that's the foundation of machine learning. From here, the journey into specific algorithms, models, and applications begins.












 -->
