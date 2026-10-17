import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dispatch, workers } from '../agent/lib/workers.ts';
const env={WORKERS_JSON:JSON.stringify([{id:'partner-bot',description:'Test',url:'https://worker.example/task',tokenEnv:'WORKER_TOKEN'}]),WORKER_TOKEN:'test-only'};
test('aucun worker par défaut',()=>assert.deepEqual(workers({}),[]));
test('rejette HTTP et identifiants dupliqués',()=>{assert.throws(()=>workers({WORKERS_JSON:env.WORKERS_JSON.replace('https:','http:')}));const w=JSON.parse(env.WORKERS_JSON)[0];assert.throws(()=>workers({WORKERS_JSON:JSON.stringify([w,w])}));});
test('refuse bot inconnu et secret manquant',async()=>{await assert.rejects(dispatch('inconnu','test','1',env));await assert.rejects(dispatch('partner-bot','test','1',{WORKERS_JSON:env.WORKERS_JSON}));});
test('envoie seulement la tâche et transmet la clef idempotente',async()=>{
 const fake=async(url, options)=>{assert.equal(url,'https://worker.example/task');assert.equal(options.redirect,'error');assert.equal(options.headers['Idempotency-Key'],'call-1');assert.deepEqual(JSON.parse(options.body),{task:'analyse',requestId:'call-1'});return Response.json({output:'terminé'});};
 assert.deepEqual(await dispatch('partner-bot','analyse','call-1',env,fake),{worker:'partner-bot',output:'terminé'});
});
test('rejette une erreur distante et une réponse trop grosse',async()=>{await assert.rejects(dispatch('partner-bot','test','1',env,async()=>new Response('',{status:500})));await assert.rejects(dispatch('partner-bot','test','1',env,async()=>new Response('x'.repeat(65000))));});
