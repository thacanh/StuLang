export default function VocabularyTable({ items }) {
    return (
      <div className="w-full border rounded-md overflow-hidden">
        <table className="w-full">
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                <td className="py-2 px-4 border-b">{item.english}</td>
                <td className="py-2 px-4 border-b">{item.vietnamese}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  
  