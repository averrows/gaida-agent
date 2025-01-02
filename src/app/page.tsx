"use client"

import { useChat } from "ai/react"
import { useQuery } from "@tanstack/react-query"
import { Chat } from "@/components/ui/chat"
import { GetTargetRecruitPayload } from "./api/recruits/target/route"

export default function ChatWithSuggestions() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    isLoading,
    stop,
  } = useChat()

  const { data: recruits, isLoading: recruitsLoading } = useQuery({
    queryKey: ['recruits'],
    queryFn: async () => {
      console.log('fetching recruits')
      const recruits = await fetch('/api/recruits/target').then(res => res.json() as Promise<GetTargetRecruitPayload[]>);
      return recruits;
    },
    refetchInterval: 1000,
  })

  return <div className="h-screen max-h-screen w-screen grid grid-cols-10 justify-center gap-2 items-center p-10">
    < div className="col-span-7 bg-gray-100 rounded-lg p-4 h-full max-h-full overflow-y-auto" >
      <Chat
        className="h-full max-h-full overflow-y-auto"
        messages={messages}
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isGenerating={isLoading}
        stop={stop}
        append={append}
        suggestions={[
          "Generate a tasty vegan lasagna recipe for 3 people.",
          "Generate a list of 5 questions for a frontend job interview.",
          "Who won the 2022 FIFA World Cup?",
        ]}
      />
    </div >
    <div className="col-span-3 h-screen">
      <div className="bg-gray-100 rounded-lg p-4 h-full sticky top-0">
        <h2 className="text-xl font-semibold mb-4">Target Recruits</h2>
        {recruitsLoading ? (
          <div>Loading...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">LinkedIn</th>
              </tr>
            </thead>
            <tbody>
              {recruits?.map((recruit) => (
                <tr key={recruit.id} className="border-b hover:bg-gray-200">
                  <td className="p-2">{recruit.name}</td>
                  <td className="p-2">
                    <a
                      href={recruit.linkedinProfileUrl ?? ''}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Profile
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  </div >
}
