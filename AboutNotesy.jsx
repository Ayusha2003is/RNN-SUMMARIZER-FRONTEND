import React from "react";
import {
  MdOutlineAccessTime,
  MdOutlineLightbulb,
  MdOutlineCheckCircle,
} from "react-icons/md";
import { FaRegFileAlt } from "react-icons/fa";
import { GiNotebook } from "react-icons/gi";

function AboutNotesy() {
  const features = [
    {
      icon: MdOutlineLightbulb,
      title: "Smart Summarization",
      description: "Clean, point-wise summaries from messy lecture notes, PDFs, and DOCX files."
    },
    {
      icon: GiNotebook,
      title: "Flashcards",
      description: "Convert notes into revision-friendly flashcards."
    },
    {
      icon: FaRegFileAlt,
      title: "Multi-format Upload",
      description: "Supports text and DOCX uploads."
    },
    {
      icon: MdOutlineAccessTime,
      title: "Time Management",
      description: "Built-in to-do list and reminders for better planning."
    },
    {
      icon: MdOutlineCheckCircle,
      title: "Improved Memory",
      description: "Reinforce knowledge with summaries."
    }
  ];

  return (
    <section className="py-16 px-6 md:px-10 bg-gray-50 text-gray-800 font-mono">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase text-gray-500 mb-2 tracking-wide">
            Why Choose Us
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Why Use <span className="text-blue-600">Notesy</span>?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Notesy is your AI-powered summarization and study assistant. It helps students{" "}
            <span className="font-semibold text-gray-800">simplify, understand, and organize</span>{" "}
            their academic content.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="p-6 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow"
              >
                <div className="mb-4 flex items-center justify-center w-12 h-12 rounded-md bg-blue-100 text-blue-600">
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-20 text-center">
          <div className="p-8 bg-white border border-gray-200 rounded-lg shadow-sm max-w-xl mx-auto">
            <h3 className="text-xl font-bold mb-3 text-gray-900">
              Did You Know?
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Students who summarize notes after each lecture improve recall by up to <span className="font-semibold text-blue-600">34%</span>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutNotesy;
