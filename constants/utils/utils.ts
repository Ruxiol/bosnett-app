import { Dimensions } from "react-native";

// Responsive Width
const screenWidth = Dimensions.get("window").width;
export const RPW = (percentage: number) => {
    return (percentage / 100) * screenWidth;
};

// Responsive Height
const screenHeight = Dimensions.get('window').height;
export const RPH = (percentage: number) => {
    return (percentage / 100) * screenHeight;
};

// Responsive Font Size
const standardWidth = 430;
export const RFS = (fontSize: number) => {
    const scale = screenWidth / standardWidth;
    const newSize = fontSize * scale;
    return newSize;
};

// Responsive Line Height
export const RLH = (fontSize: number, lineHeightMultiplier = 1.2): number =>
    Math.round(fontSize * lineHeightMultiplier);

// Truncate Text
export const truncateText = (str: string, maxLength: number) => {
    if (str.length > maxLength) {
        return str.slice(0, maxLength) + '...';
    }
    return str;
};

// Strip HTML Tags
export const stripHtmlTags = (htmlString: string) => {
    return htmlString.replace(/<[^>]*>/g, '');
};

//Letter Spacing
export const RLS = (fontSize: number) => {
    const scaleFactor = 0.03;
    return fontSize * scaleFactor;
};

// Name Initials
export const getUserInitials = (name: string): string => {
    const initials = name.split(' ').map(part => part.charAt(0)).join('');
    return initials.toUpperCase();
};

// Random Color
// export const getRandomColor = (): string => {
//     const letters = '0123456789ABCDEF';
//     let color = '#';
//     for (let i = 0; i < 6; i++) {
//         color += letters[Math.floor(Math.random() * 16)];
//     }
//     return color;
// };

// Insert @
export const insertAtCursor = (
    text: string,
    selection: { start: number, end: number },
    value: string
) => {
    const newText = text.slice(0, selection.start) + value + text.slice(selection.end);
    const newCursorPos = selection.start + value.length;
    return { newText, newCursorPos };
};

// Color Generator
export const hashCode = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

export const getColorFromHash = (hash: number): string => {
    const color = `#${((hash & 0x00FFFFFF) | 0x1000000).toString(16).substring(1)}`;
    return color;
};

export const getColorForUser = (userId: string): string => {
    const hash = hashCode(userId);
    return getColorFromHash(hash);
};