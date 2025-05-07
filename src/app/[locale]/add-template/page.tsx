"use client";

import { useEffect, useState } from "react";

export default function JSONEditor() {
  /** Data */
  const [data, setData] = useState<any>(null);
  /** Input */
  const [input, setInput] = useState(`[
    {
      "name": "Măng tươi xào thịt bò",
      "price": "155000",
      "unit": "VND" },
    {
      "name": "Bò xào lá lốt",
      "price": "155000",
      "unit": "VND"},
    {
      "name": "Súp lơ xào bò",
      "price": "155000",
      "unit": "VND"
    },
    {
      "name": "Bò xào cần tỏi",
      "price": "155000",
      "unit": "VND"
    },
    {
      "name": "Bắp bò kho gừng",
      "price": "245000",
      "unit": "VND"
    },
    {
      "name": "Bê xào xả ớt",
      "price": "165000",
      "unit": "VND"
    },
    {
      "name": "Bò xào dưa chua",
      "price": "155000",
      "unit": "VND"
    },
    {
      "name": "Bò xào rau muống",
      "price": "155000",
      "unit": "VND"
    }
  ]`);
  /** Key */
  const [key, setKey] = useState("client_id__msg_id"); // dynamic key

  const handleSave = async () => {
    try {
      /** Parse JSON */
      const JSON_INPUT = JSON.parse(input);
      /** Kiểm tra key và JSON_INPUT */
      if (!key || !JSON_INPUT) {
        alert("JSON hoặc key không hợp lệ!");
        return;
      }
      /** Gửi request lưu vào Redis */
      const RES = await fetch("/api/json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: JSON_INPUT }), // gửi key và value
      });
      /** Kết quả sau khi parse json */
      const RESULT = await RES.json();
      /** Kiểm tra kết quả */
      if (RESULT.success) {
        setData(JSON_INPUT);
      } else {
        alert("Lưu thất bại!");
      }
    } catch (err) {
      console.log(err, "err");
      alert("JSON không hợp lệ!");
    }
  };

  return (
    <main className="p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">🔧 Redis JSON Editor</h1>

      <div className="space-y-2">
        <label className="block text-sm">Key (client_id__message_id):</label>
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="w-full p-3 border rounded text-sm"
        />
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={14}
        className="w-full p-4 border rounded font-mono text-sm"
      />

      <button
        onClick={handleSave}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        💾 Lưu vào Redis
      </button>

      <h2 className="text-xl font-semibold mt-8">📦 Dữ liệu đã lưu:</h2>
      <pre className="bg-gray-100 p-4 rounded text-sm whitespace-pre-wrap">
        {data ? JSON.stringify(data, null, 2) : "Chưa có gì được lưu."}
      </pre>
    </main>
  );
}
