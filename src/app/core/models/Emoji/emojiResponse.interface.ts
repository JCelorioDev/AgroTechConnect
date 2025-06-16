export interface EmojiResponse {
    name: string;
    slug: string;
    group: Group;
    emoji_version: string;
    unicode_version: string;
    skin_tone_support: boolean;
    skin_tone_support_unicode_version?: string;
    emoji: string; 
}

export enum Group {
    Activities = "Activities",
    AnimalsNature = "Animals & Nature",
    Flags = "Flags",
    FoodDrink = "Food & Drink",
    Objects = "Objects",
    PeopleBody = "People & Body",
    SmileysEmotion = "Smileys & Emotion",
    Symbols = "Symbols",
    TravelPlaces = "Travel & Places",
}
