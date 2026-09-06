import { useEffect, useState } from "react";

import { getEvents } from "../services/eventService";
import {
    getOverview,
    getRegistrationTrends,
    getDemographics,
    getCheckInAnalytics
} from "../services/analyticsService";
import { getAIInsights } from "../services/aiService";

import OverviewCards from "../components/dashboard/OverviewCards";
import TrendChart from "../components/dashboard/TrendChart";
import DemographicsChart from "../components/dashboard/DemographicsChart";
import CheckInCard from "../components/dashboard/CheckInCard";
import AIInsightsCard from "../components/dashboard/AIInsightsCard";

const Analytics = () => {

    const [events, setEvents] = useState([]);

    const [eventId, setEventId] = useState("");

    const [overview, setOverview] = useState(null);

    const [trends, setTrends] = useState([]);

    const [demographics, setDemographics] = useState({});

    const [checkins, setCheckins] = useState(null);

    const [insights, setInsights] = useState("");

    useEffect(() => {

        loadEvents();

    }, []);

    useEffect(() => {

        if (eventId) {

            loadAnalytics();

        }

    }, [eventId]);

    const loadEvents = async () => {

        try {

            const res = await getEvents();

            setEvents(res.data.data);

            if (res.data.data.length) {

                setEventId(res.data.data[0]._id);

            }

        }

        catch (err) {

            console.log(err);

        }

    };

    const loadAnalytics = async () => {

        try {

            const [

                overviewRes,

                trendRes,

                demographicRes,

                checkinRes,

                insightRes

            ] = await Promise.all([

                getOverview(eventId),

                getRegistrationTrends(eventId),

                getDemographics(eventId),

                getCheckInAnalytics(eventId),

                getAIInsights(eventId)

            ]);

            setOverview(overviewRes.data.data);

            setTrends(trendRes.data.data);

            setDemographics(demographicRes.data.data);

            setCheckins(checkinRes.data.data);

            setInsights(insightRes.data.data);

        }

        catch (err) {

            console.log(err);

        }

    };

    return (

        <div className="space-y-8">

            <div className="flex justify-between items-center">

                <div>

                    <h1 className="text-3xl font-bold">

                        Analytics

                    </h1>

                    <p className="text-gray-500">

                        Detailed event analytics

                    </p>

                </div>

                <select

                    value={eventId}

                    onChange={(e)=>setEventId(e.target.value)}

                    className="input w-80"

                >

                    {

                        events.map(event=>(

                            <option

                                key={event._id}

                                value={event._id}

                            >

                                {event.title}

                            </option>

                        ))

                    }

                </select>

            </div>

            <OverviewCards

                overview={overview}

            />

            <div className="grid lg:grid-cols-2 gap-6">

                <TrendChart

                    data={trends}

                />

                <CheckInCard

                    data={checkins}

                />

            </div>

            <div className="grid lg:grid-cols-2 gap-6">

                <DemographicsChart

                    data={demographics}

                />

                <AIInsightsCard

                    insights={insights}

                />

            </div>

        </div>

    );

};

export default Analytics;