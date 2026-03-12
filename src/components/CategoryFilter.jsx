export default function CategoryFilter({ currentCategory, onCategoryChange }) {
  const categories = [
    { id: 'all', label: 'All' },
    { id: 'attractions', label: 'Attractions' },
    { id: 'hotels', label: 'Hotels' },
    { id: 'resorts', label: 'Resorts' }
  ];

  return (
    <div className="filter-container">
      <div className="filter-scroll">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`filter-pill ${currentCategory === cat.id ? 'active' : ''}`}
            onClick={() => onCategoryChange(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
