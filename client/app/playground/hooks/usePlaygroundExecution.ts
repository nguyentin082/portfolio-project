import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth-provider';
import { DomainEnum } from '@/types/enum';

export const usePlaygroundExecution = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleRun = async (selectedModel: DomainEnum | string) => {
        if (!user) {
            toast({
                title: 'Authentication Required',
                description: 'Please sign in to use the AI playground',
                variant: 'destructive',
            });
            return;
        }

        if (!selectedModel || !input.trim()) {
            toast({
                title: 'Missing Information',
                description: 'Please select a model and provide input',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);
        setProgress(0);

        // Simulate progress
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return prev;
                }
                return prev + Math.random() * 15;
            });
        }, 200);

        try {
            await new Promise((resolve) => setTimeout(resolve, 2000));

            let mockOutput = '';
            switch (selectedModel) {
                case DomainEnum.VEXERE_ASSISTANT:
                    mockOutput = `Based on your query "${input}", here are the available bus routes:
                    
1. Ho Chi Minh City → Da Lat
   - Departure: 08:00, 14:00, 20:00
   - Duration: 6-7 hours
   - Price: 200,000 - 350,000 VND
   - Bus types: Sleeper, Limousine

2. Recommended route: Premium Limousine 14:00 departure
   - Comfortable seating
   - Free WiFi and refreshments
   - Price: 320,000 VND

Would you like me to help you book this ticket?`;
                    break;

                case DomainEnum.FACE_RECOGNITION:
                    mockOutput = `Face Recognition Analysis Complete:
                    
📸 Image Analysis Results:
- Total faces detected: 3
- Average confidence: 94.2%
- Processing time: 1.2 seconds

👥 Face Recognition Details:
1. Face #1: John Smith (96% confidence)
2. Face #2: Unknown person (91% confidence) 
3. Face #3: Sarah Johnson (97% confidence)

✨ Suggestions:
- Tag unknown faces for future recognition
- Consider re-training model with more samples`;
                    break;

                default:
                    mockOutput = `Generated content for "${input}":

This is a sample AI-generated response that demonstrates the text generation capabilities. The AI has processed your input and created relevant, contextual content.

Key features demonstrated:
- Natural language understanding
- Contextual response generation
- Coherent and relevant output
- Multi-paragraph structure

This response would be replaced with actual AI-generated content in a production environment.`;
            }

            setProgress(100);
            setTimeout(() => {
                setOutput(mockOutput);
                setLoading(false);
                setProgress(0);
                toast({
                    title: 'Success',
                    description: 'AI processing completed!',
                });
            }, 300);
        } catch (error) {
            clearInterval(progressInterval);
            setLoading(false);
            setProgress(0);
            toast({
                title: 'Error',
                description: 'Failed to process AI request',
                variant: 'destructive',
            });
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast({
                title: 'Copied!',
                description: 'Output copied to clipboard',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to copy to clipboard',
                variant: 'destructive',
            });
        }
    };

    return {
        input,
        setInput,
        output,
        setOutput,
        loading,
        progress,
        handleRun,
        copyToClipboard,
    };
};
