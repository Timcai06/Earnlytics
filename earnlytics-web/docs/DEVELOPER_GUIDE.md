# Earnlytics Developer Guide

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

## Project Structure

```
src/
├── app/              # Next.js App Router
│   ├── (auth)/       # Route groups
│   ├── api/          # API routes
│   └── ...           # Pages
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── layout/       # Header, Footer
│   ├── animation/    # Framer Motion animations
│   ├── performance/  # Performance utilities
│   └── sections/     # Page sections
├── hooks/            # Custom React hooks
├── lib/              # Utilities
│   ├── utils.ts      # Helper functions
│   ├── ab-testing.tsx # A/B testing
│   └── export.ts     # Data export
└── styles/           # Global styles
```

## Component Guidelines

### Creating a New Component

1. **Location**: Place in appropriate folder
2. **Naming**: Use PascalCase (e.g., `Button.tsx`)
3. **Exports**: Use named exports
4. **Types**: Define interfaces for props

Example:
```tsx
interface ButtonProps {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ 
  variant = "primary", 
  size = "md",
  children,
  onClick 
}: ButtonProps) {
  return (
    <button 
      className={cn(
        "rounded-lg font-medium transition-colors",
        variant === "primary" && "bg-primary text-white",
        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-4 py-2",
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

### Using shadcn/ui

```bash
# Add a new component
npx shadcn add button

# Use in your code
import { Button } from "@/components/ui/button";
```

### Animation Components

Use the animation library for consistent animations:

```tsx
import { AnimatedCard, AnimatedButton } from "@/components/animation";

<AnimatedCard whileHover={{ scale: 1.02 }}>
  <h3>Title</h3>
  <p>Content</p>
</AnimatedCard>
```

## State Management

### Local State
Use `useState` for component-level state:

```tsx
const [isOpen, setIsOpen] = useState(false);
```

### Server State
Use React Query for server data:

```tsx
const { data, isLoading } = useQuery({
  queryKey: ["earnings", symbol],
  queryFn: () => fetchEarnings(symbol),
});
```

## Performance Best Practices

1. **Use Lazy Loading**
```tsx
import { useLazyLoad } from "@/hooks/use-performance";

const { ref, isVisible } = useLazyLoad<HTMLDivElement>();
```

2. **Optimize Images**
```tsx
import { OptimizedImage } from "@/components/performance";

<OptimizedImage 
  src="/image.jpg" 
  alt="Description"
  priority // For above-fold images
/>
```

3. **Virtual Lists for Large Data**
```tsx
import { VirtualList } from "@/components/performance";

<VirtualList
  items={largeDataArray}
  itemHeight={80}
  containerHeight={400}
  renderItem={(item) => <ItemCard data={item} />}
/>
```

## Accessibility

All components must meet WCAG 2.1 AA standards:

```tsx
// Use ARIA utilities
import { useAriaLabel, VisuallyHidden } from "@/hooks/use-aria";

// Keyboard navigation
import { useKeyboardShortcut } from "@/hooks/use-keyboard-navigation";

// Focus management
const containerRef = useFocusTrap(isOpen);
```

## Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npx playwright test
```

### Browser Compatibility
```bash
# Test on multiple browsers
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## A/B Testing

### Creating an Experiment

1. Define experiment in `lib/experiments.ts`
2. Use `useABTest` hook in component
3. Track events with `trackEvent`

```tsx
const { variant, trackEvent } = useABTest("experiment-id");

<button onClick={() => trackEvent("conversion")}>
  {variant?.config.buttonText}
</button>
```

## Data Export

Export data in various formats:

```tsx
import { exportToCSV, exportToExcel } from "@/lib/export";

const handleExport = () => {
  exportToCSV(data, "earnings-data");
};
```

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
DATABASE_URL=postgresql://...
```

## Deployment

### Vercel (Recommended)
```bash
vercel --prod
```

### Manual Build
```bash
npm run build
# Upload .next/ folder to server
```

## Troubleshooting

### Build Errors
- Check TypeScript: `npx tsc --noEmit`
- Check imports: Ensure all imports are valid
- Clear cache: `rm -rf .next node_modules && npm install`

### Runtime Errors
- Check browser console
- Verify environment variables
- Check API responses

## Contributing

1. Create feature branch
2. Make changes
3. Run tests: `npm test`
4. Run build: `npm run build`
5. Submit PR

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)
