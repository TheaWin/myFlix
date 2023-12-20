<h1>Anime Eiga (<span class="jp">アニメ 映画</span>) API</h1>
    <p> To build the server-side component of "anime films" web application. </p>
    <p> The web application will provide users with access to information about different anime films, directors, and genres.
    </p>
    <p> Users will be able to sign up, update their  personal information, and create a list of their favorite animes.</p>
    <hr>
    <h2>Design Criteria</h2>
    <h4>Essential Features</h4>
    <ul>
        <li>Return a list of ALL animes to the user</li>
        <li>Return data (description, genre, director, imageURL, whether it's featured or not) about a single anime by
            title to the user</li>
        <li>Return data about a genre (description) by name/title (e.g, "Thriller")</li>
        <li>Return data aobut a direcotr (bio, birth year, death year) by name</li>
        <li>Allow new users to register</li>
        <li>Allow users to update their user info (username, password, email, date of birth)</li>
        <li>Allow users to add a anime to their list of favorites</li>
        <li>Allow users to remove a anime from their list of favorites</li>
        <li>Allow existing users to deregister</li>
    </ul>
    <h4>Technical Requirements</h4>
    <ul>
        <li>The API must: </li>
        <ul>
            <li>be a Node.js and Express applicaiton.</li>
            <li>use REST architecture, with URL endpoints corresponding to the data operations listed above</li>
            <li>use at least three middleware modules, such as the body-parser package for reading data from requests
                and morgan for logging.</li>
            <li>use a "package.json" file</li>
            <li>provide anime information in JSON format</li>
            <li>be tested in Postman</li>
            <li>include user authentication and authorization code</li>
            <li>include data validation logic</li>
            <li>meet data security regulations</li>
            <li>be deployed to Heroku</li>
        </ul>
        <li>The database must be built using MongoDB</li>
        <li>The business logic must be modeled with Moongose</li>
        <li>The JavaScript code must be error-free</li>
        <li>The API source code must be deployed to a publicly accessible platform like GitHub</li>
    </ul>
    <hr>
    <h2>API Endpoints</h2>
    <table class="table">
        <thead class="thead-light">
            <tr>
                <th scope="col">Request</th>
                <th scope="col">URL</th>
                <th scope="col">HTTP Method</th>
                <th scope="col">Request Body Data Format</th>
                <th scope="col">Response Body Data Format</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Return a list of ALL anime to the user</td>
                <td>/anime</td>
                <td>GET</td>
                <td>None</td>
                <td>A JSON object holding data about all the anime</td>
            </tr>
            <tr>
                <td>Return data about a single anime by title</td>
                <td>/anime/[title]</td>
                <td>GET</td>
                <td>None</td>
                <td>A JSON object holding data about the requested anime. Example: <br />
                    {'name': 'My Neighbor Totoro', <br />
                    'description': 'When two girls move to the country to be near their ailing mother, they have
                    adventures with the wondrous forest spirits who live nearby.', <br/>
                    'genre': 'comedy', <br /> 
                    'director': {
                        'name': 'Hayao Miyazaki',
                        'bio': 'lorem ipsum',
                        'birthYear': 1890,
                        'deathYear': null}, <br />                   
                    'releaseYear': '1988', <br />
                    'imageUrl': 'https://example.png', <br />
                    'featured': true <br/>
                    }
                </td>
            </tr>
            <tr>
                <td>Return data of a list of anime by genre</td>
                <td>/anime/genre/[genreName]</td>
                <td>GET</td>
                <td>None</td>
                <td>An array of JSON objects holding data about all the animes by requested genre</td>
            </tr>
            <tr>
                <td>Return data about director by name</td>
                <td>/anime/directors/[directorName]</td>
                <td>GET</td>
                <td>None</td>
                <td>A JSON object holding data about the requested director. Example: <br />
                    {'directorName': 'Hayao Miyazaki', <br />
                    'birthYear': '1941', <br />
                    'deathYear': 'Present', <br />
                    'bio': 'Hayao Miyazaki is a highly acclaimed Japanese animator, director, and co-founder of Studio
                    Ghibli. Renowned for his imaginative storytelling and artistic brilliance, Miyazaki has created some
                    of the most beloved animated films worldwide. His iconic works include 'My Neighbor Totoro,'
                    'Spirited Away,' and 'Princess Mononoke.' Miyazaki's films often explore themes of environmentalism,
                    pacifism, and the wonder of childhood. With a career spanning decades, he continues to be a guiding
                    force in the animation industry, captivating audiences of all ages.'
                    }
                </td>
            </tr>
            <tr>
                <td>New users registeration</td>
                <td>/users</td>
                <td>POST</td>
                <td>
                    A JSON object holding data about the user to add, structured like: <br />
                    {'username': 'JohnDoe123', <br />
                    'name': 'John Doe', <br />
                    'email': 'john.doe@example.com', <br />
                    'password': 'securedpassword', <br />
                    'birthday': '12 Dec 2000'<br/>
                    }
                </td>
                <td>A JSON object holding data about the user that was added, including an ID: <br />
                    {'id': '1234', <br />
                    'username': 'JohnDoe123', <br />
                    'name': 'John Doe', <br />
                    'email': 'john.doe@example.com', <br />
                    'favoriteAnime': 'My Neighbor Totoro', <br />
                    }
                </td>
            </tr>
            <tr>
                <td>Update username info</td>
                <td>/users/[username]</td>
                <td>PUT</td>
                <td>A JSON object holding data about the user's username. Example: <br/>
                    {'username': 'username123'}</td>
                <td>A JSON object holding data about the user with an updated username. Example: <br/>
                    {'id': '1234', <br />
                    'username': 'NewJohnDoe', <br />
                    'name': 'John Doe', <br />
                    'email': 'john.doe@example.com', <br />
                    'favoriteAnime': 'My Neighbor Totoro', <br />
                    }
                </td>
            </tr>
            <tr>
                <td>Add an anime to the user's list of favorites</td>
                <td>/users/[username]/[name]</td>
                <td>POST</td>
                <td>A JSON object holding data about the chosen anime to add. Example: <br/>
                    {'name': 'My Neighbor Totoro', <br />
                    'description': 'When two girls move to the country to be near their ailing mother, they have
                    adventures with the wondrous forest spirits who live nearby.', <br/>
                    'genre': 'comedy', <br /> 
                    'director': {
                        'name': 'Hayao Miyazaki',
                        'bio': 'lorem ipsum',
                        'birthYear': 1890,
                        'deathYear': null}, <br />                   
                    'releaseYear': '1988', <br />
                    'imageUrl': 'https://example.png', <br />
                    'featured': true <br/>
                    }
                </td>
                <td>A text message indicating whether the anime has been successfully added</td>
            </tr>
            <tr>
                <td>Remove an anime from the user's list of favorites</td>
                <td>/users/[username]/[title]</td>
                <td>DELETE</td>
                <td>None</td>
                <td>A text message indicating whether the anime has been successfully removed</td>
            </tr>
            <tr>
                <td>User deregisteration</td>
                <td>/users/[username]</td>
                <td>DELETE</td>
                <td>None</td>
                <td>A text message indicating whether the user has been successfully deregistered</td>
            </tr>
        </tbody>
    </table>
