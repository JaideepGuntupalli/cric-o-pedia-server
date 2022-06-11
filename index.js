const express = require("express");
const axios = require("axios").default;
const cors = require("cors");

const app = express();

app.use(cors());

const imgURL =
    "https://img1.hscicdn.com/image/upload/f_auto,t_ds_wide_w_1200,q_60/lsci";

const sqImgURL =
    "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160,q_50/lsci";

const storyURL = "https://www.espncricinfo.com/story/";

app.get("/homeMatches", async (req, res) => {
    axios({
        url: "https://hs-consumer-api.espncricinfo.com/v1/pages/matches/current?lang=en",
        method: "get",
    })
        .then((response) => {
            const cusResponse = [];
            const data = response.data.matches;
            data.map((ele) => {
                let newTeams = [];
                ele.teams.map((team) => {
                    let newTeamImage = {
                        url: "https://cdn-icons-png.flaticon.com/512/2160/2160173.png",
                        caption: "Unknown team logo",
                    };
                    if (team.team.image !== null) {
                        newTeamImage = {
                            url: sqImgURL + team.team.image.url,
                            caption: team.team.image.caption,
                        };
                    }

                    let newTeam = {
                        slug: team.team.slug,
                        name: team.team.name,
                        longName: team.team.longName,
                        abbreviation: team.team.abbreviation,
                        image: newTeamImage,
                        score: team.score,
                        scoreInfo: team.scoreInfo,
                        inningNumbers: team.inningNumbers[0],
                    };
                    newTeams.push(newTeam);
                });
                let newJSON = {
                    id: ele.objectId,
                    slug: ele.slug,
                    state: ele.state,
                    series: ele.series.name,
                    startTime: ele.startTime,
                    statusText: ele.statusText,
                    teams: newTeams,
                };
                // console.log(ele);
                cusResponse.push(newJSON);
            });
            res.status(200).json(cusResponse);
        })
        .catch((err) => {
            res.status(500).json({ message: err });
        });
});

app.get("/news", async (req, res) => {
    axios({
        url: "https://hs-consumer-api.espncricinfo.com/v1/edition/feed?edition=in&lang=en&page=1&records=10",
        method: "get",
    })
        .then((response) => {
            const cusResponse = [];
            const data = response.data.results;
            data.map((ele) => {
                ele.containers.map((news) => {
                    if (
                        news.enhanced &&
                        news.type === "DEFAULT" &&
                        news.item.type === "STORY"
                    ) {
                        let newJSON = {
                            id: news.item.story.id,
                            title: news.item.story.title,
                            summary: news.item.story.summary,
                            storyUrl:
                                storyURL +
                                news.item.story.slug +
                                "-" +
                                news.item.story.objectId,
                            imgUrl:
                                imgURL + news.item.story.image.peerUrls.WIDE,
                            imgAlt: news.item.story.image.caption,
                        };
                        cusResponse.push(newJSON);
                    }
                });
            });
            res.status(200).json(cusResponse);
        })
        .catch((err) => {
            res.status(500).json({ message: err });
        });
});

app.get("/score", async (req, res) => {
    const matchId = req.query.matchId;
    const requrl = `https://hs-consumer-api.espncricinfo.com/v1/pages/match/details?lang=en&seriesId=1298423&matchId=${matchId}&latest=true`;
    axios({
        url: requrl,
        method: "get",
    })
        .then((response) => {
            res.status(200).json(response.data);
        })
        .catch((err) => {
            res.status(500).json({ message: err });
        });
});

app.listen(process.env.PORT || 8080, () => {
    console.log("Listening on port 8080");
});
