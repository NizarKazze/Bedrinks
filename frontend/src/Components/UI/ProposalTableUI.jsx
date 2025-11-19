export const CustomTableHeader = ({labels = []}) => {
    return (
        <thead className="bg-gray-50">
          <tr>
            {labels.map((label, index) => (
              <th
                key={index}
                className="py-3 px-4 text-left font-semibold text-gray-700"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
      );
}