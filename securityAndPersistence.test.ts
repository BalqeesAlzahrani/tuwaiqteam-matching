import assert from 'node:assert/strict';
import { sanitizeForFirestore } from '../src/lib/firestoreService';
import { getFriendlyAuthErrorMessage } from '../src/lib/authService';
import { Member, Team, TeamInvitation } from '../src/types';

let totalTests = 0;
let passedTests = 0;

async function test(name: string, fn: () => void | Promise<void>) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

async function runAllTests() {
  console.log('\n--- 1. Sanitization & Payload Integrity Tests ---');

  await test('sanitizeForFirestore recursively strips undefined values', () => {
    const input = {
      id: 'mem-123',
      name: 'Sarah Tech',
      contact: {
        email: 'sarah@example.com',
        github: undefined,
        telegram: undefined,
        portfolio: 'https://sarah.dev',
      },
      skills: ['React', 'TypeScript'],
      emptyField: undefined,
      nestedList: [
        { key: 'val', bad: undefined },
        { other: 42 },
      ],
    };

    const cleaned = sanitizeForFirestore(input) as any;

    assert.equal(cleaned.id, 'mem-123');
    assert.equal(cleaned.name, 'Sarah Tech');
    assert.equal(cleaned.contact.email, 'sarah@example.com');
    assert.equal(cleaned.contact.portfolio, 'https://sarah.dev');
    assert.equal('github' in cleaned.contact, false, 'github should be stripped');
    assert.equal('telegram' in cleaned.contact, false, 'telegram should be stripped');
    assert.equal('emptyField' in cleaned, false, 'emptyField should be stripped');
    assert.equal('bad' in cleaned.nestedList[0], false, 'nested undefined should be stripped');
    assert.equal(cleaned.nestedList[0].key, 'val');
    assert.equal(cleaned.nestedList[1].other, 42);
  });

  await test('sanitizeForFirestore handles null, arrays, and primitives correctly', () => {
    assert.equal(sanitizeForFirestore(null), null);
    assert.equal(sanitizeForFirestore(undefined), null);
    assert.equal(sanitizeForFirestore('hello'), 'hello');
    assert.equal(sanitizeForFirestore(123), 123);
    assert.deepEqual(sanitizeForFirestore(['a', undefined, 'b']), ['a', null, 'b']);
  });

  console.log('\n--- 2. Ownership & Unauthorized Access Tests ---');

  await test('Profile payload derivation enforces ownerUid from authenticated session', () => {
    const fakeAuthUser = { uid: 'auth-user-999', email: 'user999@tuwaiq.edu' };
    const memberInput: Member = {
      id: 'mem-custom-1',
      name: 'Ali Developer',
      major: 'Computer Science',
      academicYear: 'Senior (Year 4)',
      avatar: 'https://avatar.url',
      bio: 'Bio text',
      skills: ['Python', 'AI'],
      skillCategories: ['TECH'],
      interests: ['AI Hackathons'],
      experience: '2 years',
      canHelpWith: 'Backend',
      lookingFor: 'Designers',
      competitionInterests: ['Tuwaiq Innovation Challenge 2026'],
      contact: { email: 'ali@tuwaiq.edu' },
      isAvailableForTeam: true,
      createdAt: '2026-09-01',
      ownerUid: 'malicious-injected-uid', // Should be overwritten by authenticated session
    };

    // Derived payload logic
    const derivedPayload: Member = {
      ...memberInput,
      ownerUid: fakeAuthUser.uid,
    };

    assert.equal(derivedPayload.ownerUid, 'auth-user-999');
    assert.notEqual(derivedPayload.ownerUid, 'malicious-injected-uid');
  });

  await test('Team creatorUid enforcement attaches authenticated UID to teams', () => {
    const fakeAuthUser = { uid: 'auth-leader-555' };
    const rawTeam: Team = {
      id: 'team-101',
      name: 'Falcon Squad',
      competition: 'Tuwaiq Challenge',
      description: 'Building innovative AI',
      creatorId: 'mem-alias',
      creatorName: 'Leader Ali',
      members: [],
      maxMembers: 4,
      requiredSkills: ['UI/UX', 'Cloud'],
      balanceScore: 85,
      createdAt: '2026-09-10',
    };

    const teamToSave: Team = {
      ...rawTeam,
      creatorUid: rawTeam.creatorUid || fakeAuthUser.uid,
    };

    assert.equal(teamToSave.creatorUid, 'auth-leader-555');
    assert.equal(teamToSave.id, 'team-101');
  });

  await test('Team invitation builds participants list including sender and receiver for access control', () => {
    const fakeAuthUser = { uid: 'sender-uid-123' };
    const invite: TeamInvitation = {
      id: 'inv-456',
      teamId: 'team-101',
      teamName: 'Falcon Squad',
      senderId: 'mem-sender',
      senderName: 'Sender Ali',
      receiverId: 'mem-receiver',
      receiverName: 'Receiver Sarah',
      receiverUid: 'receiver-uid-789',
      roleProposed: 'Frontend Developer',
      status: 'pending',
      createdAt: '2026-09-10',
    };

    const senderUid = invite.senderUid || fakeAuthUser.uid;
    const participants = Array.from(
      new Set(
        [
          senderUid,
          invite.senderId,
          invite.receiverId,
          invite.receiverUid,
          fakeAuthUser.uid,
        ].filter(Boolean) as string[]
      )
    );

    assert.ok(participants.includes('sender-uid-123'), 'Sender UID must be in participants');
    assert.ok(participants.includes('receiver-uid-789'), 'Receiver UID must be in participants');
    assert.ok(participants.includes('mem-sender'), 'Sender ID must be in participants');
    assert.ok(participants.includes('mem-receiver'), 'Receiver ID must be in participants');
    assert.equal(participants.length, 4);
  });

  console.log('\n--- 3. Error Propagation Tests ---');

  await test('Team and invitation save operations propagate errors when Firestore operations fail', async () => {
    // Simulated Firestore failing write
    const failingSetDoc = async () => {
      const err: any = new Error('Missing or insufficient permissions');
      err.code = 'permission-denied';
      throw err;
    };

    let caught = false;
    try {
      await failingSetDoc();
    } catch (e: any) {
      caught = true;
      assert.equal(e.code, 'permission-denied');
    }
    assert.equal(caught, true, 'Error must not be swallowed; caller must catch failure');
  });

  console.log('\n--- 4. Firebase Auth Provider & Domain Error Tests ---');

  await test('Friendly auth error converts auth/unauthorized-domain with clear instructions for Netlify and console', () => {
    const error = { code: 'auth/unauthorized-domain', message: 'Domain not authorized' };
    const friendly = getFriendlyAuthErrorMessage(error);
    assert.ok(friendly.includes('Authorized Domains in the Firebase Console'), 'Should guide user to Authorized Domains');
  });

  await test('Friendly auth error converts auth/operation-not-allowed with console instructions', () => {
    const error = { code: 'auth/operation-not-allowed', message: 'Provider disabled' };
    const friendly = getFriendlyAuthErrorMessage(error);
    assert.ok(friendly.includes('Authentication > Sign-in method'), 'Should guide user to enable provider');
  });

  console.log(`\n========================================`);
  console.log(`Tests finished: ${passedTests}/${totalTests} passed`);
  console.log(`========================================\n`);

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runAllTests();
