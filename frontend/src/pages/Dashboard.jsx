import { useEffect, useState } from "react";

import {
  getEvents,
} from "../services/eventService";

import {
  getOverview,
  getRegistrationTrends,
  getDemographics,
  getCheckInAnalytics,
  getSessionAnalytics,
} from "../services/analyticsService";

import {
  getAIInsights,
} from "../services/aiService";

import {
  getExecutiveDashboard,
} from "../services/dashboardService";

import {
  getAllRegistrations,
} from "../services/registrationService";

import {
  getOperationalAlerts,
} from "../services/operationalAlertService";

import OverviewCards from "../components/dashboard/OverviewCards";
import TrendChart from "../components/dashboard/TrendChart";
import DemographicsChart from "../components/dashboard/DemographicsChart";
import CheckInCard from "../components/dashboard/CheckInCard";
import AIInsightsCard from "../components/dashboard/AIInsightsCard";
import RecentRegistrationsTable from "../components/dashboard/RecentRegistrationsTable";
import SessionAnalyticsCard from "../components/dashboard/SessionAnalyticsCard";
import ExecutiveDashboard from "../components/dashboard/ExecutiveDashboard";


const Dashboard = () => {

  const [events, setEvents] =
    useState([]);

  const [selectedEvent, setSelectedEvent] =
    useState("");

  const [overview, setOverview] =
    useState(null);

  const [trends, setTrends] =
    useState([]);

  const [demographics, setDemographics] =
    useState({});

  const [checkins, setCheckins] =
    useState(null);

  const [insights, setInsights] =
    useState("");

  const [registrations, setRegistrations] =
    useState([]);

  const [sessionAnalytics, setSessionAnalytics] =
    useState(null);

  const [executiveData, setExecutiveData] =
    useState(null);

  const [alerts, setAlerts] =
    useState([]);

  const [alertsLoading, setAlertsLoading] =
    useState(true);

  const [loading, setLoading] =
    useState(true);


  // ==========================================
  // LOAD EVENTS + ALERTS
  // ==========================================

  useEffect(() => {

    loadEvents();
    loadOperationalAlerts();

  }, []);


  // ==========================================
  // LOAD DASHBOARD
  // ==========================================

  useEffect(() => {

    if (selectedEvent) {
      loadDashboard();
    }

  }, [selectedEvent]);


  // ==========================================
  // GET EVENTS
  // ==========================================

  const loadEvents = async () => {

    try {

      const res =
        await getEvents();

      const eventList =
        res.data.data || [];

      setEvents(eventList);

      if (eventList.length > 0) {

        setSelectedEvent(
          eventList[0]._id
        );

      }

    } catch (err) {

      console.log(
        "Load Events Error:",
        err
      );

    }

  };


  // ==========================================
  // LOAD OPERATIONAL ALERTS
  // ==========================================

  const loadOperationalAlerts = async () => {

    try {

      setAlertsLoading(true);

      const res =
        await getOperationalAlerts();

      setAlerts(
        res.data?.alerts || []
      );

    } catch (err) {

      console.log(
        "Load Operational Alerts Error:",
        err
      );

    } finally {

      setAlertsLoading(false);

    }

  };


  // ==========================================
  // LOAD DASHBOARD DATA
  // ==========================================

  const loadDashboard = async () => {

    try {

      setLoading(true);

      const [
        overviewRes,
        trendRes,
        demographicRes,
        checkinRes,
        insightRes,
        registrationRes,
        sessionAnalyticsRes,
        executiveDashboardRes,
      ] = await Promise.all([

        getOverview(
          selectedEvent
        ),

        getRegistrationTrends(
          selectedEvent
        ),

        getDemographics(
          selectedEvent
        ),

        getCheckInAnalytics(
          selectedEvent
        ),

        getAIInsights(
          selectedEvent
        ),

        getAllRegistrations(),

        getSessionAnalytics(
          selectedEvent
        ),

        getExecutiveDashboard(
          selectedEvent
        ),

      ]);


      setOverview(
        overviewRes.data.data
      );

      setTrends(
        trendRes.data.data
      );

      setDemographics(
        demographicRes.data.data
      );

      setCheckins(
        checkinRes.data.data
      );

      setInsights(
        insightRes.data.data
      );

      setSessionAnalytics(
        sessionAnalyticsRes.data.data
      );

      setExecutiveData(
        executiveDashboardRes
      );


      // ======================================
      // FILTER REGISTRATIONS
      // ======================================

      const allRegistrations =
        registrationRes.data.data || [];

      setRegistrations(
        allRegistrations.filter((r) => {

          const registrationEventId =
            typeof r.eventId === "object"
              ? r.eventId?._id
              : r.eventId;

          return (
            String(registrationEventId) ===
            String(selectedEvent)
          );

        })
      );


    } catch (err) {

      console.log(
        "Load Dashboard Error:",
        err
      );

    } finally {

      setLoading(false);

    }

  };


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (
      <div className="page flex justify-center items-center">

        Loading Dashboard...

      </div>
    );

  }


  // ==========================================
  // UI
  // ==========================================

  return (

    <div className="space-y-8">


      {/* ======================================
          HEADER
      ====================================== */}

      <div className="flex justify-between items-center">

        <div>

          <h1 className="text-3xl font-bold">
            Dashboard
          </h1>

          <p className="text-gray-500">
            Event Analytics
          </p>

        </div>


        <select
          value={selectedEvent}
          onChange={(e) =>
            setSelectedEvent(
              e.target.value
            )
          }
          className="input w-80"
        >

          {events.map(
            (event) => (

              <option
                key={event._id}
                value={event._id}
              >
                {event.title}
              </option>

            )
          )}

        </select>

      </div>


      {/* ======================================
          EXECUTIVE DASHBOARD
      ====================================== */}

      <ExecutiveDashboard
        data={executiveData}
      />


      {/* ======================================
          OPERATIONAL ALERTS
      ====================================== */}

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">

        <div className="flex items-center justify-between mb-5">

          <div>

            <h2 className="text-xl font-bold text-gray-900">
              Operational Alerts
            </h2>

            <p className="text-sm text-gray-500">
              Important issues requiring attention
            </p>

          </div>


          {alerts.length > 0 && (

            <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-sm font-semibold">

              {alerts.length} Alert
              {alerts.length !== 1
                ? "s"
                : ""}

            </span>

          )}

        </div>


        {/* Loading */}

        {alertsLoading ? (

          <div className="py-8 text-center text-gray-500">

            Loading alerts...

          </div>


        ) : alerts.length === 0 ? (

          /* No Alerts */

          <div className="py-8 text-center">

            <div className="text-green-500 text-3xl mb-2">
              ✓
            </div>

            <p className="font-semibold text-gray-700">
              No operational alerts
            </p>

            <p className="text-sm text-gray-400">
              Everything looks good.
            </p>

          </div>


        ) : (

          /* Alerts */

          <div className="space-y-3">

            {alerts.map(
              (alert, index) => {

                const critical =
                  alert.severity ===
                  "Critical";

                const high =
                  alert.severity ===
                  "High";


                return (

                  <div
                    key={
                      alert.incidentId ||
                      alert.sponsorId ||
                      index
                    }
                    className={`
                      rounded-2xl
                      border
                      p-4
                      ${
                        critical
                          ? "bg-red-50 border-red-200"
                          : high
                          ? "bg-orange-50 border-orange-200"
                          : "bg-yellow-50 border-yellow-200"
                      }
                    `}
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <h3 className="font-semibold text-gray-900">
                          {alert.title}
                        </h3>

                        <p className="text-sm text-gray-600 mt-1">
                          {alert.message}
                        </p>

                        {alert.status && (

                          <p className="text-xs text-gray-400 mt-2">

                            Status:{" "}

                            {alert.status}

                          </p>

                        )}

                      </div>


                      <span
                        className={`
                          shrink-0
                          px-2 py-1
                          rounded-full
                          text-xs
                          font-semibold
                          ${
                            critical
                              ? "bg-red-100 text-red-700"
                              : high
                              ? "bg-orange-100 text-orange-700"
                              : "bg-yellow-100 text-yellow-700"
                          }
                        `}
                      >

                        {alert.severity}

                      </span>

                    </div>

                  </div>

                );

              }
            )}

          </div>

        )}

      </div>


      {/* ======================================
          REGISTRATION OVERVIEW
      ====================================== */}

      <OverviewCards
        overview={overview}
      />


      {/* ======================================
          REGISTRATION + CHECK-IN
      ====================================== */}

      <div className="grid lg:grid-cols-2 gap-6">

        <TrendChart
          data={trends}
        />

        <CheckInCard
          data={checkins}
        />

      </div>


      {/* ======================================
          DEMOGRAPHICS + AI INSIGHTS
      ====================================== */}

      <div className="grid lg:grid-cols-2 gap-6">

        <DemographicsChart
          data={demographics}
        />

        <AIInsightsCard
          insights={insights}
        />

      </div>


      {/* ======================================
          SESSION ANALYTICS
      ====================================== */}

      <SessionAnalyticsCard
        data={sessionAnalytics}
      />


      {/* ======================================
          RECENT REGISTRATIONS
      ====================================== */}

      <RecentRegistrationsTable
        registrations={registrations}
      />


    </div>

  );

};


export default Dashboard;