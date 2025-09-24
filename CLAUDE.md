# Globber Project - Claude Assistant Instructions

## Project Overview
**Globber**는 React 19와 Next.js 15를 기반으로 한 3D 지구본 여행 시각화 애플리케이션입니다. 사진의 EXIF 위치 정보를 추출하여 지구본에 표시하는 현대적인 웹 애플리케이션입니다.

## Architecture Context
- **Framework**: Next.js 15.5.2, React 19.1.0
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS v4, CVA, clsx
- **State**: Zustand, TanStack React Query
- **3D Graphics**: Globe.gl, React-Globe.gl, Three.js
- **Image Processing**: EXIFR, HEIC2ANY
- **External APIs**: Google Maps Services
- **Tools**: Biome (linting/formatting), pnpm
- **Deployment**: Docker (standalone output)

## Critical Project-Specific Rules

### Environment Variables (🔴 CRITICAL)
```bash
# Server-side only (API routes)
GOOGLE_MAPS_API_KEY=your_key_here

# Client-side (browser accessible)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
```
**Never mix these two patterns. Always validate which context needs which key.**

### Code Quality Standards
- **NO console.log statements** - Use proper logging or remove entirely
- **NO TODO comments in production code** - Complete implementation or file issue
- **Always handle HEIC image conversion** - Use existing heic2any integration
- **Maintain mobile-first design** - Max width 512px constraint

### Component Patterns to Follow
```typescript
// Dynamic import for SSR-incompatible libraries
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

// Custom hooks for complex state
export const useGlobeState = (patterns: TravelPattern[]) => {
  // Complex zoom/selection stack logic
};

// Proper forwardRef for imperative APIs
const ReactGlobe = forwardRef<ReactGlobeRef, ReactGlobeProps>((props, ref) => {
  // Component implementation
});
```

### File Organization Rules
- **Globe components**: `/src/components/react-globe/`
- **Image metadata**: `/src/components/image-metadata/`
- **API routes**: `/src/app/api/`
- **Custom hooks**: `/src/hooks/`
- **Constants**: `/src/constants/` (watch for duplication!)
- **Utilities**: `/src/utils/`

## Known Technical Debt

### High Priority Fixes Needed
1. **Environment Variable Consistency**
   - Files affected: `layout.tsx:30`, `places/route.ts:27,79`, `geocode/route.ts:14`
   - Problem: Inconsistent GOOGLE_MAPS_API_KEY usage
   - Action: Standardize to proper Next.js patterns

2. **Debug Artifact Cleanup**
   - Files with console.log: `useGlobeState.ts`, `useClustering.ts`, `GoogleMapsModal.tsx`, `ImageMetadata.tsx`, `places/route.ts`
   - Action: Remove all debugging statements

3. **Complete API Integration**
   - File: `src/app/page.tsx:8`
   - Problem: Hardcoded `hasGlobe` state with TODO
   - Action: Implement real API endpoint

### Architecture Improvements
- **Add React Error Boundaries** - No error handling currently
- **Refactor Complex State** - `useGlobeState.ts` is 169 lines, needs splitting
- **Consolidate Constants** - Duplicate zoom configurations between files
- **Add Input Validation** - API routes lack proper Zod validation

## Development Commands
```bash
# Development
pnpm dev

# Production build
pnpm build
pnpm start

# Code quality
pnpm lint      # Biome lint with --write
pnpm format    # Biome format with --write
pnpm check     # Biome check with --write
pnpm ci        # Biome CI mode

# Token building (custom)
pnpm tokens:build
```

## Testing Strategy
Currently **no tests implemented**. Priority areas for testing:
- Complex state management in `useGlobeState`
- EXIF data processing in `processFile.ts`
- API route error handling
- Globe interaction behaviors

## Performance Considerations
- Globe.gl requires dynamic import (SSR incompatible)
- HEIC conversion is CPU intensive - handle async properly
- Mobile-first design for 512px viewport
- Font preloading for Pretendard implemented

## Security Notes
- API keys properly segregated (when used correctly)
- No obvious XSS vulnerabilities
- Input validation missing on API endpoints
- Consider rate limiting for Google Maps API calls

## Common Issues & Solutions

### "Globe not rendering"
- Check dynamic import is used: `{ ssr: false }`
- Verify window object access guards
- Ensure proper container dimensions

### "HEIC images not processing"
- Verify heic2any import: `const { default: heic2any } = await import("heic2any")`
- Check file type detection: `file.type.toLowerCase().includes("heic")`
- Handle blob conversion properly

### "Google Maps API errors"
- Verify correct env var for context (client vs server)
- Check API key has required services enabled
- Validate lat/lng parameters

## Architectural Decision Records
- **Globe Library Choice**: React-Globe.gl chosen for React integration over raw Globe.gl
- **Image Processing**: Client-side HEIC conversion for better UX vs server processing
- **State Management**: Custom hooks over Redux for simpler travel pattern state
- **Styling**: TailwindCSS v4 for utility-first approach with design system
- **Build Tool**: Next.js standalone output for Docker containerization

## Future Roadmap
Based on architectural analysis, prioritize:
1. Production readiness (error handling, logging)
2. Testing implementation
3. Performance monitoring
4. Enhanced documentation
5. Advanced globe interactions

---

**Last Updated**: 2025-09-24
**Architecture Score**: 7.2/10 (Good foundation, needs production prep)

## Emergency Contacts & Resources
- **Architectural Report**: `claudedocs/architectural-analysis-report.md`
- **Main Globe Component**: `src/components/react-globe/ReactGlobe.tsx`
- **State Management**: `src/hooks/useGlobeState.ts`
- **Image Processing**: `src/lib/processFile.ts`