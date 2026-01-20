import React from "react";
import { Video, Users, Calendar, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

const meetingTypes = [
  {
    id: "instant",
    icon: Video,
    title: "Start an Instant Meeting",
    description: "Start an impromptu meeting with anyone",
    color: "bg-blue-600 hover:bg-blue-700",
  },
  {
    id: "join",
    icon: Users,
    title: "Join Meeting", 
    description: "Join a meeting via invitation link",
    color: "bg-green-600 hover:bg-green-700",
  },
  {
    id: "schedule",
    icon: Calendar,
    title: "Schedule Meeting",
    description: "Plan your meeting for later",
    color: "bg-purple-600 hover:bg-purple-700",
  },
  {
    id: "recordings",
    icon: Play,
    title: "View Recordings",
    description: "Playback recordings of previous meetings", 
    color: "bg-orange-600 hover:bg-orange-700",
  },
];

export default function Home() {
  const navigate = useNavigate();

  const handleMeetingAction = (type: string) => {
    switch (type) {
      case "instant":
        const meetingId = Math.random().toString(36).substring(2, 15);
        navigate(`/call/${meetingId}`);
        break;
      case "join":
        navigate("/call");
        break; 
      case "schedule":
        navigate("/scheduler");
        break;
      case "recordings":
        navigate("/recordings");
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Stream
          </h1>
          <p className="text-xl text-gray-600">
            Start your video meeting instantly or schedule one for later
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {meetingTypes.map((meeting) => {
            const Icon = meeting.icon;
            return (
              <div
                key={meeting.id}
                className={`${meeting.color} rounded-xl p-6 text-white cursor-pointer transition-all duration-200 transform hover:scale-105 shadow-lg`}
                onClick={() => handleMeetingAction(meeting.id)}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="bg-white/20 rounded-full p-4 mb-4">
                    <Icon size={32} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{meeting.title}</h3>
                  <p className="text-sm opacity-90">{meeting.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Quick Join
            </h2>
            <p className="text-gray-600 mb-6">
              Have a meeting ID? Join directly below
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="text"
                placeholder="Enter meeting ID"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200">
                Join Meeting
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Video className="text-blue-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">HD Video Quality</h3>
            <p className="text-gray-600">Crystal clear video calls with optimized bandwidth</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="text-green-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Group Meetings</h3>
            <p className="text-gray-600">Host meetings with up to 50 participants</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Calendar className="text-purple-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Easy Scheduling</h3>
            <p className="text-gray-600">Schedule meetings and send invitations effortlessly</p>
          </div>
        </div>
      </div>
    </div>
  );
}