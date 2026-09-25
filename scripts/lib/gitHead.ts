/**
 * 診断データと診断エンジンを「その時点の内容」で読み込む。
 * - loadFromGit：git の指定コミット（既定は HEAD＝公開版）の src を一時フォルダに取り出して読み込む
 * - loadFromWorkingTree：作業中の src を一時フォルダにコピーして読み込む
 * どちらも毎回新しいフォルダから読み込むため、同じプロセス内でファイルを書き換えた後でも最新の内容になる
 * （node はいちど読み込んだモジュールを使い回すため、元の場所から読み直すと古い内容のままになる）。
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import type { Diagnosis } from '../../src/types/diagnosis.ts'
import type { RunDiagnosis } from './diagnosisChecks.ts'

export interface LoadedDiagnoses {
  diagnoses: Diagnosis[]
  runDiagnosis: RunDiagnosis
  cleanup: () => void
}

async function importFrom(dir: string): Promise<LoadedDiagnoses> {
  const index = await import(pathToFileURL(path.join(dir, 'src/data/diagnoses/index.ts')).href)
  const engine = await import(pathToFileURL(path.join(dir, 'src/engine/diagnosisEngine.ts')).href)
  return {
    diagnoses: index.diagnoses as Diagnosis[],
    runDiagnosis: engine.runDiagnosis as RunDiagnosis,
    cleanup: () => fs.rmSync(dir, { recursive: true, force: true }),
  }
}

export async function loadFromGit(root: string, ref = 'HEAD'): Promise<LoadedDiagnoses> {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pittari-git-'))
  const archive = spawnSync('git', ['archive', '--format=tar', ref, 'src'], { cwd: root, maxBuffer: 200 * 1024 * 1024 })
  if (archive.status !== 0) throw new Error(`git archive ${ref} に失敗しました: ${archive.stderr.toString()}`)
  const untar = spawnSync('tar', ['-x', '-C', dir], { input: archive.stdout, maxBuffer: 200 * 1024 * 1024 })
  if (untar.status !== 0) throw new Error(`${ref} の src の展開に失敗しました: ${untar.stderr.toString()}`)
  return importFrom(dir)
}

export async function loadFromWorkingTree(root: string): Promise<LoadedDiagnoses> {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pittari-work-'))
  fs.cpSync(path.join(root, 'src'), path.join(dir, 'src'), { recursive: true })
  return importFrom(dir)
}
