
import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { WorkflowEngine } from '@/lib/workflow-engine';

// Configuration for Autonomous Bot
const GEMINI_KEY = "AIzaSyAA2v_r7p8ELu7vHjpzgcs-5FCOfkJfCug";
const FONNTE_TOKEN = "RhdusQWYFAEANd2tGm16"; 

/**
 * Enhanced Webhook Ingestor for FlowMind.
 * Path 'bot-wa-pribadi' acts as an autonomous assistant using Fonnte & Gemini.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { path: string } }
) {
  const { path } = params;
  let body: any = {};
  
  try {
    body = await req.json();
  } catch (e) {
    // Allow empty body
  }
  
  const { firestore } = initializeFirebase();

  // SPECIAL CASE: Autonomous WhatsApp Bot Assistant via Fonnte
  if (path === 'bot-wa-pribadi') {
    try {
      // Fonnte sends 'message' for the text and 'sender' for the WA number
      const messageBody = body.message?.trim();
      const senderNumber = body.sender;

      if (!messageBody) {
        return NextResponse.json({ status: "No message received" });
      }

      // Handle simple status command
      if (messageBody === '/status') {
        const statusMsg = "💻 STATUS SERVER:\n\nWeb UI: ONLINE\nBot WA: ONLINE (Fonnte Bridge)\nEngine Status: Ready to execution.";
        await fetch('https://api.fonnte.com/send', {
          method: 'POST',
          headers: {
            'Authorization': FONNTE_TOKEN,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            target: senderNumber,
            message: statusMsg
          })
        });
        return NextResponse.json({ success: true, reply: statusMsg });
      }

      // 1. Generate response using Gemini AI (Junior Frontend Persona)
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Kamu adalah Junior Frontend Engineer berbakat yang melayani Bos kamu (seorang Senior Dev). Jawab dengan padat, langsung ke poin teknis, gunakan markdown code block yang rapi, dan prioritaskan blok kode bersih tanpa banyak basa-basi.\n\nUser: ${messageBody}`
              }]
            }]
          })
        }
      );

      const geminiData = await geminiResponse.json();
      
      if (geminiData.error) {
        throw new Error(`Gemini Error: ${geminiData.error.message}`);
      }

      const aiReply = geminiData.candidates[0].content.parts[0].text;

      // 2. Send reply back to WhatsApp via Fonnte
      await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: {
          'Authorization': FONNTE_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          target: senderNumber,
          message: aiReply
        })
      });

      // Log the interaction in Firestore for history
      await addDoc(collection(firestore, 'executions'), {
        workflowId: 'bot-wa-pribadi',
        status: 'success',
        startedAt: serverTimestamp(),
        finishedAt: serverTimestamp(),
        graphLog: { 
          sender: senderNumber,
          query: messageBody,
          reply: aiReply 
        }
      });

      return NextResponse.json({ success: true, reply: aiReply });

    } catch (error: any) {
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }
  }

  // DEFAULT CASE: Trigger existing UI-defined workflows
  try {
    const workflowsRef = collection(firestore, 'workflows');
    const q = query(workflowsRef, where('webhookPath', '==', path));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json({ error: 'No active workflow matches this path' }, { status: 404 });
    }

    const workflowDoc = querySnapshot.docs[0];
    const workflowData = workflowDoc.data();

    if (!workflowData.isActive) {
      return NextResponse.json({ error: 'Workflow is suspended' }, { status: 403 });
    }

    // Initiate the engine execution asynchronously
    const engine = new WorkflowEngine(workflowData.nodes, workflowData.edges, body);
    engine.run().catch(err => console.error("Workflow Runtime Error:", err));

    await addDoc(collection(firestore, 'executions'), {
      workflowId: workflowDoc.id,
      status: 'pending',
      startedAt: serverTimestamp(),
      graphLog: { 
        triggerData: body,
        logs: [`[Webhook] Received payload at /api/webhook/${path}`]
      }
    });

    return NextResponse.json({ message: 'Trigger accepted' }, { status: 202 });

  } catch (error: any) {
    return NextResponse.json({ error: 'Execution engine failed' }, { status: 500 });
  }
}
